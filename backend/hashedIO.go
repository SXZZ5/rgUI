package backend

import (
	"os"

	"github.com/zeebo/xxh3"
)

type CustomReader struct {
	srcfile *os.File
	hasher  *xxh3.Hasher
}

func (cr *CustomReader) Read(b []byte) (int, error) {
	n, err := cr.srcfile.Read(b)
	//cr.hasher.Write(b) DOING SO IS A VERY SUBTLE ERROR. We don't want the hasher to hash the
	// entire byte buffer but instead only the valid data containing prefix.
	cr.hasher.Write(b[:n]) //hashing only prefix that file.Read actually managed to fillup.
	return n, err
}

func (cr *CustomReader) GetHash() uint64 {
	return cr.hasher.Sum64()
}

func (cr *CustomReader) Init(file *os.File) {
	cr.srcfile = file
	cr.hasher.Reset()
}

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------

type CustomWriter struct {
	destfile *os.File
	hasher   *xxh3.Hasher
	caller   *Fops
}

//constructor ka kya hi karunga. Literal me daal dunga sabkuch bhad me jaye.

func (cw *CustomWriter) Write(p []byte) (int, error) {
	n, err := cw.destfile.Write(p)
	cw.hasher.Write(p[:n])           //hash only the part file.Write could succesfully write.
	cw.caller.AddDoneWork(uint64(n)) // to facilitate progress measuring setup for
	return n, err
}

func (cw *CustomWriter) GetHash() uint64 {
	return cw.hasher.Sum64()
}

func (cw *CustomWriter) Init(file *os.File) {
	cw.destfile = file
	cw.hasher.Reset()
}
