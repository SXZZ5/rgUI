package backend

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sync/atomic"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type SkDirEntry struct {
	Name  string
	Path  string
	Isdir bool
}

type Fops struct {
	ctx       context.Context
	Selected  []string
	ToMove    []string
	totalwork atomic.Uint64
	donework  atomic.Uint64
	Cut       bool
}

func (fops *Fops) BeginTransfer(destination string, overwrite bool) {
	runtime.EventsEmit(fops.ctx, "progress", 0)
	defer runtime.EventsEmit(fops.ctx, "progress", 100)
	if len(fops.ToMove) <= 0 {
		fmt.Println("being transfer: Nothing inside ToMove[]")
		return
	}
	timcounter := time.Now()
	fops.donework.Store(0)
	fops.totalwork.Store(0)
	destination = filepath.Clean(destination)
	fmt.Println("begin transfer requested at destination", destination)
	fmt.Println("selected files for transfer", fops.ToMove)
	transfer := Transfer{}
	errlist := transfer.InitTransfer(fops, destination, overwrite)
	fops.FileLogger(errlist)
	if fops.Cut {
		fmt.Println("going to begin deletion")
		fmt.Println(fops)
		fops.Selected = fops.ToMove
		fops.BeginDeletion(false)
	}
	fops.RemoveAllSelected()
	fmt.Println("Transfer completed")
	fmt.Println("elapsed:", time.Since(timcounter))

	results := struct {
		Status   string
		Contents TransferError
	}{}
	if len(errlist.StatErrors) > 0 || len(errlist.IOErrors) > 0 {
		results.Status = "problems"
		results.Contents = errlist
	} else {
		results.Status = "success"
		results.Contents = errlist
	}

	fmt.Println(results)
	runtime.EventsEmit(fops.ctx, "transfer_results", results)
}

func (fops *Fops) BeginDeletion(flag bool) {
	fmt.Println("Begin deletion called", fops.Selected)
	runtime.EventsEmit(fops.ctx, "progress", 0)
	//flag true if you want to move it to recycle bin
	//flag false to completely delete
	if len(fops.Selected) <= 0 {
		return
	}

	transfer := Transfer{}
	transfer.InitDeletion(fops, flag)
	runtime.EventsEmit(fops.ctx, "progress", 100)
}

func (fops *Fops) AddDoneWork(z uint64) {
	fops.donework.Add(z)
	aload_donework := fops.donework.Load()
	aload_totalwork := fops.totalwork.Load()
	// fmt.Println("z", z, "aload_donework", aload_donework, "aload_totalwork", aload_totalwork)
	if aload_totalwork == 0 {
		return
	}
	ratio := (float64(aload_donework) / float64(aload_totalwork)) * 100
	fmt.Println("Adding Done work", fops.donework.Load(), "ratio", ratio)

	runtime.EventsEmit(fops.ctx, "progress", ratio)
	// fmt.Println("emitted an event with ratio", ratio)
}
func (fops *Fops) AddTotalWork(z uint64) {
	fops.totalwork.Add(z)
	fmt.Println("Adding total work", fops.totalwork.Load())
}

func (fops *Fops) AddSelected(path string) {
	//I trust the frontend to not send same Add command twice.
	path = filepath.Clean(path)
	fops.Selected = append(fops.Selected, path)
	fmt.Println("addselected", fops.Selected)
}

func (fops *Fops) RemoveSelected(path string) {
	path = filepath.Clean(path)
	pos := -1
	for i, v := range fops.Selected {
		if v == path {
			pos = i
			break
		}
	}
	if pos == -1 {
		return
	}

	fops.Selected[pos] = fops.Selected[len(fops.Selected)-1]
	fops.Selected = fops.Selected[:len(fops.Selected)-1]
	fmt.Println("removeselected", fops.Selected)
}

func (fops *Fops) RemoveAllSelected() {
	fops.Selected = []string{}
}

func (fops *Fops) CopyCommand() {
	fops.ToMove = fops.Selected
	fops.Cut = false
	//copy and cut operations override each other while sharing the underlying selection
	//and ToMove buffers.
}

func (fops *Fops) CutCommand() {
	fops.ToMove = fops.Selected
	fops.Cut = true
}

func (fops *Fops) Startup(ctx context.Context) {
	fops.ctx = ctx
}

func (fops *Fops) GetParent(path string) string {
	return filepath.Dir(path)
}

func (fops *Fops) FileRenamer(path string, newName string) bool {
	_, err := os.Stat(path)
	if err != nil {
		return false
	}
	parent := filepath.Dir(path)
	err = os.Rename(path, filepath.Join(parent, newName))
	return err == nil
}

func (fops *Fops) Renamer(path string, newName string) error {
	parent := filepath.Dir(path)
	entries, err := os.ReadDir(parent)
	if err != nil {
		return err
	}
	for _, v := range entries {
		if v.Name() == newName {
			newName += "_copy"
			break
		}
	}
	err = os.Rename(path, filepath.Join(parent, newName))
	if err != nil {
		return err
	}
	return nil
}

func (fops *Fops) FileLogger(v ...interface{}) error {
	file, err := os.OpenFile("C:/Users/Sushi/Desktop/logfile", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = fmt.Fprintln(file, v...)
	return err
}
