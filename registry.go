package main

import (
	"context"
	"fmt"
	"io"
	"os/exec"
	"path/filepath"
	"strings"

	"golang.org/x/sys/windows/registry"
)

type CmdRecord struct {
	Executable string
	Args       []string
}

type RegistryOptions struct {
	ctx      context.Context
	path     string
	KeyNames []string
	Records  []CmdRecord
}

func (reg *RegistryOptions) startup(ctx context.Context) {
	reg.ctx = ctx
}

func (reg *RegistryOptions) DirectoryHandler(path string) {
	k, err := registry.OpenKey(registry.CLASSES_ROOT, `Directory\shell`, registry.READ)
	if err != nil {
		fmt.Println("Error opening the registry key:", err)
		return
	}
	defer k.Close()

	subKeys, err := k.ReadSubKeyNames(0)
	if err != nil {
		fmt.Println("Error reading subkeys:", err)
		return
	}

	for _, subKey := range subKeys {
		commandKeyPath := filepath.Join(`Directory\shell`, subKey, "command")
		commandKey, err := registry.OpenKey(registry.CLASSES_ROOT, commandKeyPath, registry.QUERY_VALUE)
		if err != nil {
			fmt.Println("Error opening command key:", err)
			continue
		}

		defaultValue, _, err := commandKey.GetStringValue("")
		commandKey.Close()
		if err != nil {
			fmt.Println("Error reading default value:", err)
			continue
		}

		reg.KeyNames = append(reg.KeyNames, subKey)

		// Properly parse the command
		cmdParts := parseCommand(defaultValue, path)
		if len(cmdParts) == 0 {
			fmt.Println("Skipping invalid command:", defaultValue)
			continue
		}

		executable := cmdParts[0]
		args := cmdParts[1:]

		reg.Records = append(reg.Records, CmdRecord{executable, args})

		// fmt.Println("Executing:", executable, args) // Debugging output

		// cmd := exec.Command(executable, args...)
		// err = cmd.Start() // Start without blocking
		// if err != nil {
		// 	fmt.Println("Error executing command:", err)
		// }
	}
}

// parseCommand properly replaces placeholders and splits the command
func parseCommand(command, path string) []string {
	// Ensure the path is properly quoted if it contains spaces
	if strings.Contains(path, " ") && !strings.HasPrefix(path, `"`) {
		path = `"` + path + `"`
	}

	// Replace placeholders (%1, %V)
	command = strings.ReplaceAll(command, "%1", path)
	command = strings.ReplaceAll(command, "%V", path)

	// Split command into executable and arguments while preserving quotes
	parts := splitCommand(command)
	if len(parts) == 0 {
		return nil
	}
	return parts
}

// splitCommand splits a command string while preserving quoted arguments
func splitCommand(command string) []string {
	var parts []string
	var current strings.Builder
	inQuotes := false

	for i := 0; i < len(command); i++ {
		c := command[i]
		if c == '"' {
			inQuotes = !inQuotes
		} else if c == ' ' && !inQuotes {
			if current.Len() > 0 {
				parts = append(parts, current.String())
				current.Reset()
			}
		} else {
			current.WriteByte(c)
		}
	}
	if current.Len() > 0 {
		parts = append(parts, current.String())
	}

	return parts
}

func (reg *RegistryOptions) FileHandler(path string) {
	extension := filepath.Ext(path)
	extension = filepath.Join(extension, "OpenWithProgids")
	k, err := registry.OpenKey(registry.CLASSES_ROOT, extension, registry.ALL_ACCESS)
	if err != nil {
		fmt.Println("Error opening the registry key", extension)
		return
	}
	values, err := k.ReadValueNames(0)
	if err != nil && err != io.EOF {
		fmt.Println("Error reading the values of the key")
		return
	}
	fmt.Println("read the values successfully")
	fmt.Println(values)
	for _, z := range values {
		executable, err := GetAppPathFromProgID(z)
		if err != nil {
			fmt.Println("err in progId", z, err)
		}
		reg.KeyNames = append(reg.KeyNames, z)
		reg.Records = append(reg.Records, CmdRecord{executable, []string{path}})
	}
	k.Close()
}

func GetAppPathFromProgID(progID string) (string, error) {
	regPath := fmt.Sprintf(`%s\shell\open\command`, progID)

	key, err := registry.OpenKey(registry.CLASSES_ROOT, regPath, registry.QUERY_VALUE)
	if err != nil {
		return "", fmt.Errorf("failed to open registry key: %w", err)
	}
	defer key.Close()

	// Read the default command
	exePath, _, err := key.GetStringValue("")
	if err != nil {
		return "", fmt.Errorf("failed to get executable path: %w", err)
	}

	// Extract the actual executable path
	parts := strings.SplitN(exePath, "\"", 3)
	if len(parts) > 1 {
		return parts[1], nil
	}
	fmt.Println("exepath retrieved:", exePath)
	return exePath, nil
}

func (reg *RegistryOptions) Executor(idx int) {
	fmt.Println("Executor called")
	record := reg.Records[idx]
	fmt.Println(record.Executable, record.Args)
	cmd := exec.Command(record.Executable, record.Args...)
	err := cmd.Start()
	if err != nil {
		fmt.Println("Error executing command", err)
	}
	// return err
}

func (reg *RegistryOptions) MenuInfoProvider(path string) []string {
	reg.KeyNames = []string{}
	reg.Records = []CmdRecord{}
	reg.path = path
	extension := filepath.Ext(path)
	if extension == "" {
		reg.DirectoryHandler(path)
	} else {
		reg.FileHandler(path)
	}
	fmt.Println(reg.KeyNames)
	fmt.Println(reg.Records)
	return reg.KeyNames
}
