package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
)

type SkDirEntry struct {
	Name  string
	Path  string
	Isdir bool
}

type Fops struct {
	ctx          context.Context
	Selected     []string
	ToMove       []string
	totalwork    int64
	donework     int64
	transferring bool
	sizeCountingDone bool 
}

func (fops *Fops) BeginTransfer(destination string) {
	fops.transferring = true
	fops.sizeCountingDone = false
	fops.totalwork = 0
	fops.donework = 0
	defer func(fops *Fops) { fops.transferring = false; }(fops)
	destination = filepath.Clean(destination)
	fmt.Println("begin transfer requested at destination", destination)
	fmt.Println("selected file for transfer", fops.ToMove)
	transfer := Transfer{}
	transfer.InitTransfer(fops, destination)
	errlist := transfer.GetErrList()
	fmt.Println(errlist)
	fops.RemoveAllSelected()
}

func (fops *Fops) GetPercentageCompletion() int {
	if !fops.transferring {
		return 100
	}
	if fops.totalwork == 0 || !fops.sizeCountingDone  {
		return 0
	}
	ratio := float64(fops.donework) / float64(fops.totalwork) * 100
	return int(ratio)
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
}

func (fops *Fops) startup(ctx context.Context) {
	fops.ctx = ctx
}

func (fops *Fops) GetDir(path string) []SkDirEntry {
	if path == "null" {
		return []SkDirEntry{}
	}
	path += "/"
	fmt.Println("path called:", path)
	list, err := os.ReadDir(path)
	if err != nil {
		fmt.Println("Could not get directory information")
	}
	retlist := []SkDirEntry{}
	hiddenlist := []SkDirEntry{}
	for _, v := range list {
		objpath := path + v.Name()
		if v.Name()[0] == '.' {
			hiddenlist = append(hiddenlist, SkDirEntry{v.Name(), objpath, v.IsDir()})
		} else {
			retlist = append(retlist, SkDirEntry{v.Name(), objpath, v.IsDir()})
		}
	}
	retlist = append(retlist, hiddenlist...)
	return retlist
}

func (fops *Fops) GetParent(path string) string {
	return filepath.Dir(path)
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
