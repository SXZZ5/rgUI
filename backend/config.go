package backend

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	// "time"
)

type Skinfo struct {
	Name string
	Path string
	// color string //could be some "rgba(x,y,z,a)" that I can just pass to the css.
}

type Data struct {
	Drives []Skinfo
	Pinned []Skinfo
}

type Config struct {
	ctx       context.Context
	user_home string
	cfgPath   string
	logPath   string
	data      Data
}

func (config *Config) Startup(ctx context.Context) {
	config.ctx = ctx
	user_home, err := os.UserHomeDir()
	if err != nil {
		fmt.Println("err:", err)
		return
	}

	fmt.Println("user home dir:", user_home)
	config.user_home = user_home
	// config_path := filepath.Join(user_home, "bbfm")
	config_path := filepath.Join(user_home, "bbfm_config.json")
	config.cfgPath = config_path
	config.logPath = filepath.Join(user_home, "bbfm.log")

	config.InitJSON()
}

func (config *Config) GetConfigData() Data {
	// time.Sleep(time.Second*3)
	fmt.Println(config.data)
	return config.data
}

func (config *Config) PinALocation(path string) {
	path = filepath.Clean(path)
	item := Skinfo{filepath.Base(path), path}
	config.data.Pinned = append(config.data.Pinned, item)
	config.WriteConfigAsJson()
}

func (config *Config) UnpinALocation(path string) {
	path = filepath.Clean(path)
	pos := -1
	for i, v := range config.data.Pinned {
		if v.Path == path {
			pos = i
			break
		}
	}
	if pos == -1 {
		return
	}
	res := config.data.Pinned[:pos]
	res = append(res, config.data.Pinned[pos+1:]...)
	config.data.Pinned = res
	config.WriteConfigAsJson()
}

func (config *Config) InitJSON() {
	jsonFile, err := os.ReadFile(config.cfgPath)
	if err != nil {
		config.FileLogger("Config probably did not exist", err)
		config.data.Drives = config.Drivescheck()
		config.data.Pinned = []Skinfo{}
		config.WriteConfigAsJson()
		return
	}

	data := Data{}
	err = json.Unmarshal(jsonFile, &data)
	if err != nil {
		config.FileLogger("error in unmarshalling", err)
		return
	}
	config.FileLogger("JSON that was read from file", jsonFile)
	config.FileLogger("JSON loaded data", data)
	data.Drives = config.Drivescheck()
	config.data = data
	config.WriteConfigAsJson()
}

func (config *Config) WriteConfigAsJson() error {
	res, err := json.Marshal(config.data)
	if err != nil {
		fmt.Println("error Marshalling config struct into json", err)
		return err
	}

	file, err := os.OpenFile(config.cfgPath, os.O_RDWR|os.O_CREATE|os.O_TRUNC|os.O_SYNC, 0666)
	if err != nil {
		fmt.Println("error in creating the config file", err)
		return err
	}
	file.Write(res)
	return nil
}

func (config *Config) Drivescheck() []Skinfo {
	drives := []Skinfo{}
	for i := 1; i <= 26; i++ {
		ch := string(rune('A' + i - 1))
		ch += ":"
		_, err := os.Stat(ch)
		if err != nil {
			continue
		}
		drives = append(drives, Skinfo{ch, ch})
		fmt.Println(ch)
	}
	return drives
}

func (config *Config) FileLogger(v ...interface{}) error {
	file, err := os.OpenFile(config.logPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = fmt.Fprintln(file, v...)
	return err
}
