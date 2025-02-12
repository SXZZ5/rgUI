package backend

//This file deals with:
// . creating worker pool
// . Copying and writing bytes to a new location.
// . placing status messages on the channel about success or failure.
// . deleting files also thanks to lord claude 3.5 sonnet.

import (
	"context"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"os"
	fp "path/filepath"

	"github.com/zeebo/xxh3"
)

type ErrStruct struct {
	Src string
	Err error
}

type TransferError struct {
	StatErrors []ErrStruct
	IOErrors   []ErrStruct
}

type Work struct {
	Src     string // Absolute SRC path of the file.
	Destsrc string // the destination path of a file relative to DEST_ROOT.
}

type Transfer struct {
	files       []Work
	caller      *Fops
	directories []string
	Destination string
}

func (transfer *Transfer) InitTransfer(
	caller *Fops,
	destination string,
	overwrite bool) TransferError {
	// store caller info in struct only to regularly send updates of how much transfer
	// is completed.
	transfer.caller = caller
	transfer.Destination = destination
	transfer.files = []Work{}

	transferError := TransferError{}

	// fmt.Println(caller.ToMove)

	directories := []string{}
	for _, v := range caller.ToMove {
		info, err := os.Stat(v)
		if err != nil {
			// transfer = nil
			errstruct := ErrStruct{v, err}
			transferError.StatErrors = append(transferError.StatErrors, errstruct)
			continue
		}
		if info.IsDir() {
			directories = append(directories, v)
		} else {
			transfer.files = append(transfer.files, Work{v, transfer.destPathOf(fp.Base(v))})
		}
		fmt.Println(v, info.Name(), info.Size())
	}

	transfer.directories = []string{}
	for _, v := range directories {
		tmpfiles := []Work{}
		tmpdirectories := []string{}
		walkerr := fp.WalkDir(v, func(path string, d fs.DirEntry, tmperr error) error {
			if tmperr != nil {
				return tmperr
			}
			relpath, err := fp.Rel(fp.Dir(v), path)
			if err != nil {
				return err
			}
			if !d.IsDir() {
				tmpfiles = append(tmpfiles, Work{path, transfer.destPathOf(relpath)})
			} else {
				tmpdirectories = append(tmpdirectories, transfer.destPathOf(relpath))
			}
			return nil
		})
		if walkerr != nil {
			errstruct := ErrStruct{v, walkerr}
			transferError.StatErrors = append(transferError.StatErrors, errstruct)
			continue
		}
		transfer.directories = append(transfer.directories, transfer.destPathOf(fp.Base(v)))
		transfer.directories = append(transfer.directories, tmpdirectories...)
		transfer.files = append(transfer.files, tmpfiles...)
	}

	// fmt.Println(transfer.files)
	//Check for stuff that will be overwritten
	if !overwrite {
		ovw_errs := []ErrStruct{}
		for _, v := range transfer.files {
			_, err := os.Stat(v.Destsrc)
			if !os.IsNotExist(err) {
				errstruct := ErrStruct{v.Destsrc, errors.New("already exists")}
				ovw_errs = append(ovw_errs, errstruct)
			}
		}
		for _, v := range transfer.directories {
			_, err := os.Stat(v)
			if !os.IsNotExist(err) {
				errstruct := ErrStruct{v, errors.New("already exists")}
				ovw_errs = append(ovw_errs, errstruct)
			}
		}
		if len(ovw_errs) > 0 {
			return TransferError{ovw_errs, []ErrStruct{}}
		}
	}

	for _, v := range transfer.files {
		info, err := os.Stat(v.Src)
		if err != nil {
			continue
		}
		caller.AddTotalWork(uint64(info.Size()))
	}

	for _, v := range transfer.directories {
		err := os.MkdirAll(v, 0755)
		if err != nil {
			errstruct := ErrStruct{v, err}
			transferError.StatErrors = append(transferError.StatErrors, errstruct)
			transfer = nil
			continue
		}
	}
	// fmt.Println("Verify if directories have been replicated or not")
	// fmt.Println("Size of transfer.files", unsafe.Sizeof(transfer.files))
	// fmt.Println("Size of directories stringslice", unsafe.Sizeof(directories))
	transfer.makePool(&transferError)
	fmt.Println("Transfer Completed")
	return transferError
}

func (transfer *Transfer) destPathOf(relpath string) string {
	return fp.Join(transfer.Destination, relpath)
}

type Statuspair struct {
	pos int
	err error
}

func (transfer *Transfer) makePool(transferError *TransferError) {
	worklen := len(transfer.files)
	work := make(chan int, worklen)
	status := make(chan Statuspair, worklen)

	ctx, cancelfunc := context.WithCancel(context.Background())
	for i := 0; i <= 10; i++ {
		go transfer.worker(work, status, ctx)
	}

	go func() {
		for i := 1; i <= len(transfer.files); i++ {
			work <- i
			// fmt.Println("put on queue", i)
		}
	}()

	// fmt.Println("beginning monitoring statuses", cnt)

	fwd := 0
	cnt := len(transfer.files)
	for rec := range status {
		cnt--
		fwd++
		// fmt.Print("[",fwd,",",cnt,"]");
		if rec.err != nil {
			errstruct := ErrStruct{transfer.files[rec.pos-1].Src, rec.err}
			transferError.IOErrors = append(transferError.IOErrors, errstruct)
		}
		if cnt == 0 {
			// fmt.Println("count reached zero")
			// fmt.Println("going to exit listening loop")
			// fmt.Println("transfer is finished according to my code")
			break
		}
	}

	cancelfunc()
	// fmt.Println("TRANSFERS FINISHED")
}

func (transfer *Transfer) worker(work chan int, status chan Statuspair, ctx context.Context) {
	cw := CustomWriter{nil, xxh3.New(), transfer.caller}
	cr := CustomReader{nil, xxh3.New()}
	buf := make([]byte, 1024*512)
	for {
		select {
		case idx := <-work:
			// err := transfer.skwriter(&transfer.files[idx-1])
			err := transfer.skwriter(&transfer.files[idx-1], &cw, &cr, &buf)
			// err := transfer.skwriter(&transfer.files[idx-1], &cw, &cr)
			status <- Statuspair{idx, err}

		case <-ctx.Done():
			return
		}
	}
}

func (transfer *Transfer) skwriter(
	wrk *Work,
	cw *CustomWriter,
	cr *CustomReader,
	buffer *[]byte,
) error {
	srcfile, err := os.Open(wrk.Src)
	if err != nil {
		return err
	}
	defer srcfile.Close()

	destfile, err := os.Create(wrk.Destsrc)
	if err != nil {
		return err
	}
	defer destfile.Close()

	cw.Init(destfile)
	cr.Init(srcfile)

	// cr := CustomReader{srcfile, xxh3.New()}
	// cw := CustomWriter{destfile, xxh3.New(), transfer.caller}
	// buf := make([]byte, 1024*512)

	_, err = io.CopyBuffer(cw, cr, *buffer)
	if err != nil {
		return err
	}

	if cw.GetHash() == cr.GetHash() {
		return nil
	} else {
		return errors.New("hash verification failed")
	}
}

func (transfer *Transfer) InitDeletion(caller *Fops, flag bool) {
	for _, v := range caller.Selected {
		if flag {
			RecycleBin_Deleter(v)
		} else {
			ManualPermanent_Deleter(v)
		}
	}
}

func RecycleBin_Deleter(filePath string) {

	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		os.Exit(1)
	}

	err := MoveToRecycleBin(filePath)
	if err != nil {
		fmt.Println(err)
	}

	// fmt.Printf("Successfully moved '%s' to recycle bin\n", filePath)
}

func ManualPermanent_Deleter(path string) {
	info, err := os.Stat(path)
	if err != nil {
		fmt.Println(path, "does not exist")
		return
	}
	if info.IsDir() {
		if err := os.RemoveAll(path); err != nil {
			fmt.Println(path, "deletion error", err)
		}
	} else {
		if err := os.Remove(path); err != nil {
			fmt.Println(path, "deletion error", err)
		}
	}
}
