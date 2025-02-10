package backend

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (fops *Fops) GetDirEvents(path string) {
	path += "/"
	path = filepath.Clean(path)
	fmt.Println("GetDirEvents called")
	if path == "null" {
		return
	}
	fmt.Println("path called:", path)
	list, err := os.ReadDir(path)
	if err != nil {
		fmt.Println("Could not get directory information")
	}
	file_retlist := []string{}
	file_hiddenlist := []string{}
	dir_retlist := []string{}
	dir_hiddenlist := []string{}

	for _, v := range list {

		if v.Name()[0] == '.' {
			if v.IsDir() {
				dir_hiddenlist = append(dir_hiddenlist, "("+v.Name())
			} else {
				file_hiddenlist = append(file_hiddenlist, ")"+v.Name())
			}
		} else {
			if v.IsDir() {
				dir_retlist = append(dir_retlist, "("+v.Name())
			} else {
				file_retlist = append(file_retlist, ")"+v.Name())
			}
		}
	}
	dir_retlist = append(dir_retlist, file_retlist...)
	dir_retlist = append(dir_retlist, dir_hiddenlist...)
	dir_retlist = append(dir_retlist, file_hiddenlist...)
	fmt.Println("go compuation done")

	lim := 10
	sum := 0

	buffer := []string{}
	for _, v := range dir_retlist {
		buffer = append(buffer, v)
		if len(buffer) > lim {
			// fmt.Println("just emitted an event", buffer)
			runtime.EventsEmit(fops.ctx, "dirdata", buffer)
			sum = sum + len(buffer)
			buffer = buffer[:0]
			lim = 2 * lim //exponentially increase the batch size
		}
	}
	if len(buffer) > 0 {
		// fmt.Println("just emitted an event", buffer)
		runtime.EventsEmit(fops.ctx, "dirdata", buffer)
		sum = sum + len(buffer)
		buffer = nil
	}

	//final empty event to signify end
	runtime.EventsEmit(fops.ctx, "dirdata", []string{})
	fmt.Println("total sum of bufcontens", sum)
}
