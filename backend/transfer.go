package backend

//This file deals with:
// . creating worker pool
// . Copying and writing bytes to a new location.
// . placing status messages on the channel about success or failure.
// . deleting files also thanks to lord claude 3.5 sonnet.

import (
	"context"
	"errors"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
)

type Work struct {
	Src    string
	Modsrc string
	Status int
}

type Transfer struct {
	files       []Work
	caller      *Fops
	directories []string
	Destination string
}

func (transfer *Transfer) InitTransfer(caller *Fops, destination string) error {
	// store caller info in struct only to regularly send updates of how much transfer
	// is completed.
	transfer.caller = caller
	transfer.Destination = destination
	transfer.files = []Work{}

	// fmt.Println(caller.ToMove)

	directories := []string{}
	for _, v := range caller.ToMove {
		info, err := os.Stat(v)
		if err != nil {
			transfer = nil
			return err
		}
		if info.IsDir() {
			directories = append(directories, v)
		} else {
			transfer.files = append(transfer.files, Work{v, filepath.Base(v), 0})
		}
		caller.AddTotalWork(int64(info.Size()))
	}

	transfer.directories = []string{}
	for _, v := range directories {
		walkerr := filepath.WalkDir(v, func(path string, d fs.DirEntry, tmperr error) error {
			if tmperr != nil {
				return errors.New("something bad happened during WalkDir")
			}
			// fmt.Println("Walkdir", path, tmperr)
			if !d.IsDir() {
				transfer.files = append(transfer.files, Work{path, CutPrefix_(path, v), 0})
			} else {
				transfer.directories = append(transfer.directories, CutPrefix_(path, v))
			}
			return nil
		})
		if walkerr != nil {
			transfer = nil
			directories = nil
			return walkerr
		}
		transfer.directories = append(transfer.directories, filepath.Base(v))
	}
	for _, v := range transfer.directories {
		err := os.MkdirAll(transfer.gen_dest(v), 0755)
		if err != nil {
			transfer = nil
			return err
		}
	}
	// fmt.Println("Verify if directories have been replicated or not")
	// fmt.Println("Size of transfer.files", unsafe.Sizeof(transfer.files))
	// fmt.Println("Size of directories stringslice", unsafe.Sizeof(directories))
	transfer.makePool()
	// fmt.Println("Transfer Completed")
	return nil
}

func (transfer *Transfer) gen_dest(src string) string {
	return filepath.Join(transfer.Destination, src)
}

func CutPrefix_(child, base string) string {
	res, ok := strings.CutPrefix(child, filepath.Dir(base))
	if !ok {
		// fmt.Println(base, child, res)
		panic("child does not have parent as a prefix!!!!!!")
	}
	// fmt.Println(base, child, res)
	return res
}

type Statuspair struct {
	pos  int
	flag int
}

func (transfer *Transfer) makePool() {
	worklen := len(transfer.files)
	work := make(chan int, worklen)
	status := make(chan Statuspair, worklen)

	ctx, cancelfunc := context.WithCancel(context.Background())
	for i := 0; i <= 50; i++ {
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
		// fmt.Println("fwd",fwd);
		transfer.files[rec.pos-1].Status = rec.flag
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
	for {
		select {
		case idx := <-work:
			// fmt.Println("worker picked", idx)

			if err := transfer.skwriter(transfer.files[idx-1]); err != nil {
				// fmt.Println(transfer.files[idx-1].Src,
				// 	transfer.gen_dest(transfer.files[idx-1].Modsrc),
				// 	err)
				status <- Statuspair{idx, -1}
			} else {
				// fmt.Println(transfer.files[idx-1].Src,
				// 	transfer.gen_dest(transfer.files[idx-1].Modsrc),
				// 	err)
				status <- Statuspair{idx, 1}
			}

		case _ = <-ctx.Done():
			return
		}
	}
}

type CustomWriter struct {
	file   *os.File
	caller *Fops
	buffer []byte
}

func (customwriter *CustomWriter) Write(p []byte) (n int, err error) {
	internal_n, internal_err := customwriter.file.Write(p)
	customwriter.caller.AddDoneWork(int64(internal_n))
	return internal_n, internal_err
}

func (transfer *Transfer) skwriter(wrk Work) error {
	srcfile, err := os.Open(wrk.Src)
	if err != nil {
		return err
	}

	destfile, err := os.Create(transfer.gen_dest(wrk.Modsrc))
	if err != nil {
		return err
	}

	customwriter := &CustomWriter{destfile, transfer.caller, make([]byte, 1024*128)}

	_, err = io.CopyBuffer(customwriter, srcfile, customwriter.buffer)
	if err != nil {
		return err
	}
	srcfile.Close()
	customwriter.file.Close()
	// fmt.Println("closed srcfile and destfile")
	customwriter.buffer = nil
	return nil
}

func (transfer *Transfer) GetErrList() []string {
	res := []string{}
	for _, v := range transfer.files {
		if v.Status <= 0 {
			res = append(res, v.Src)
		}
	}
	return res
}

func (transfer *Transfer) InitDeletion(caller *Fops, flag bool) {
	// fmt.Println("inside init deletion")
	for _, v := range caller.Selected {
		// fmt.Println(v)
		if flag {
			RecycleBin_Deleter(v)
		} else {
			ManualPermanent_Deleter(v)
		}
	}
	// fmt.Println("init deletion finished")
}

func RecycleBin_Deleter(filePath string) {

	// Check if file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		// fmt.Printf("Error: file '%s' does not exist\n", filePath)
		os.Exit(1)
	}

	err := MoveToRecycleBin(filePath)
	if err != nil {
		// fmt.Printf("Error moving file to recycle bin: %v\n", err)
		os.Exit(1)
	}

	// fmt.Printf("Successfully moved '%s' to recycle bin\n", filePath)
}

func ManualPermanent_Deleter(filePath string) {
	info, err := os.Stat(filePath)
	if err != nil {
		// fmt.Println(filePath, "does not exist")
		return
	}
	if info.IsDir() {
		if err := os.RemoveAll(filePath); err != nil {
			// fmt.Println(filePath, "deletion error", err)
		}
	} else {
		if err := os.Remove(filePath); err != nil {
			// fmt.Println(filePath, "deletion error", err)
		}
	}
}
