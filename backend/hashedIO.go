package backend

import (
	"os"

	"github.com/zeebo/xxh3"
)

type CustomWriter struct {
	destfile *os.File
	hasher   *xxh3.Hasher
	caller   *Fops
}

//constructor ka kya hi karunga. Literal me daal dunga sabkuch bhad me jaye.

func (cw *CustomWriter) Write(p []byte) (int, error) {
	n, err := cw.destfile.Write(p)
	cw.caller.AddDoneWork(int64(n)) // to facilitate progress measuring setup for
	cw.hasher.Write(p)
	return n, err
}

func (cw *CustomWriter) GetHash() uint64 {
	return cw.hasher.Sum64()
}

func (cw *CustomWriter) Init(file *os.File) {
	cw.destfile = file
	cw.hasher.Reset()
}

// ----------------------------------------------------------------------------
type CustomReader struct {
	srcfile *os.File
	hasher  *xxh3.Hasher
}

func (cr *CustomReader) Read(b []byte) (int, error) {
	n, err := cr.srcfile.Read(b)
	cr.hasher.Write(b)
	return n, err
}

func (cr *CustomReader) GetHash() uint64 {
	return cr.hasher.Sum64()
}

func (cr *CustomReader) Init(file *os.File) {
	cr.srcfile = file
	cr.hasher.Reset()
}
