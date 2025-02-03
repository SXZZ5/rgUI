package main

import (
	"context"
	"fmt"
	"os"
)

type Fops struct {
	ctx context.Context
}

func (fops *Fops) startup(ctx context.Context) {
	fops.ctx = ctx
}

func (fops *Fops) GetDir(path string) []string {
	if path == "null" {
		return []string{}
	}

	path += "/"
	fmt.Println("path called:", path)
	list, err := os.ReadDir(path)
	if err != nil {
		fmt.Println("Could not get directory information")
	}
	retlist := []string{}
	for i, v := range list {
		fmt.Println(i, v.Name())
		retlist = append(retlist, v.Name())
	}
	return retlist
}
