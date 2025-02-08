// CREDITS: CLAUDE 3.5 SONNET
// My tiny brain was not capable of digesting this Shell API

package backend

import (
	"fmt"
	"path/filepath"
	"syscall"
	"unsafe"
)

var (
	shell32         = syscall.NewLazyDLL("shell32.dll")
	shFileOperation = shell32.NewProc("SHFileOperationW")
)

type SHFILEOPSTRUCTW struct {
	hwnd                  uintptr
	wFunc                 uint32
	pFrom                 *uint16
	pTo                   *uint16
	fFlags                uint16
	fAnyOperationsAborted bool
	hNameMappings         uintptr
	lpszProgressTitle     *uint16
}

const (
	FO_DELETE          = 3
	FOF_ALLOWUNDO      = 0x40
	FOF_NOCONFIRMATION = 0x10
	FOF_SILENT         = 0x4
)

func MoveToRecycleBin(path string) error {
	// Get the absolute path
	absPath, err := filepath.Abs(path)
	if err != nil {
		return fmt.Errorf("failed to get absolute path: %v", err)
	}

	// The path needs to be double-null terminated, but we need to do it after UTF16 conversion
	fromPathUTF16, _ := syscall.UTF16FromString(absPath)
	// Create a new slice with room for an extra null terminator
	fromPathDoubleNull := make([]uint16, len(fromPathUTF16)+1)
	copy(fromPathDoubleNull, fromPathUTF16)
	// The second null terminator is already there since we allocated +1 space

	// Initialize the SHFILEOPSTRUCTW structure
	fileOp := &SHFILEOPSTRUCTW{
		wFunc: FO_DELETE,
		pFrom: &fromPathDoubleNull[0],
		fFlags: FOF_ALLOWUNDO | FOF_NOCONFIRMATION | FOF_SILENT,
		// fFlags: FOF_SILENT | FOF_NOCONFIRMATION,
	}

	// Call SHFileOperation
	ret, _, _ := shFileOperation.Call(uintptr(unsafe.Pointer(fileOp)))

	if ret != 0 {
		return fmt.Errorf("file operation failed with code: %d", ret)
	}

	return nil
}
