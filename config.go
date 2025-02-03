package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	// "time"
)

type PinnedLoc struct {
	path       string
	identifier string
	// color string //could be some "rgba(x,y,z,a)" that I can just pass to the css.
}

type Data struct {
	Drives []string
	Pinned []PinnedLoc
}

type Config struct {
	ctx       context.Context
	user_home string
	cfgPath   string
	data      Data
}

func (config *Config) startup(ctx context.Context) {
	config.ctx = ctx
	user_home, err := os.UserHomeDir()
	if err != nil {
		fmt.Println("err:", err)
		return
	}

	drives := config.Drivescheck()

	fmt.Println("user home dir:", user_home)
	config.user_home = user_home
	// config_path := filepath.Join(user_home, "bbfm")
	config_path := filepath.Join(user_home, "bbfm_config.json")
	config.cfgPath = config_path

	_, err = os.Stat(config_path)
	if err != nil {
		data, _ := config.LoadJson()
		data.Drives = drives
		config.data = data
		config.WriteConfigAsJson()
	} else {
		data := Data{}
		data.Drives = drives
		config.data = data
		config.WriteConfigAsJson()
	}
}

func (config *Config) GetConfigData () Data {
    // time.Sleep(time.Second*3)
    fmt.Println(config.data);
    return config.data
}

func (config *Config) PinALocation(path string) {
	item := PinnedLoc{path, filepath.Base(path)}
	config.data.Pinned = append(config.data.Pinned, item)
	config.WriteConfigAsJson()
}

func (config *Config) LoadJson() (Data, error) {
	jsonFile, err := os.ReadFile(config.cfgPath)
	if err != nil {
		fmt.Println("error opening config file", err)
		return Data{}, err
	}

	data := Data{}
	err = json.Unmarshal(jsonFile, &data)
	if err != nil {
		fmt.Println("error in unmarshalling", err)
		return Data{}, err
	}

	return data, nil
}

func (config *Config) WriteConfigAsJson() error {
	res, err := json.Marshal(config.data)
	if err != nil {
		fmt.Println("error Marshalling config struct into json", err)
		return err
	}

	file, err := os.OpenFile(config.cfgPath, os.O_RDWR|os.O_CREATE, 0666)
	if err != nil {
		fmt.Println("error in creating the config file", err)
		return err
	}

	file.Write(res)
	return nil
}

func (config *Config) Drivescheck() []string {
	drives := []string{}
	for i := 1; i <= 26; i++ {
		ch := string('A' + i - 1)
		ch += ":"
		_, err := os.Stat(ch)
		if err != nil {
			continue
		}
		drives = append(drives, ch)
        fmt.Println(ch);
	}
	return drives
}
