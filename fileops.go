package main

import (
	"context"
	"fmt"
	"os"
)

type SkDirEntry struct {
	Name  string
	Path  string
	Isdir bool
}

type Fops struct {
	ctx context.Context
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
    if path[len(path)-1] != '/' {
        path += "/"
    }
    
    idx := len(path)
    cnt := 0
    for i:=len(path); i>=1; i-- {
        if path[i-1] != '/' {
            continue
        }
        cnt++
        if cnt == 2 {
            idx = i
            break
        }
    }

    if cnt < 2 {
        return path
    } else {
        return path[:idx-1]
    }
}


