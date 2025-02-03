package main

import (
	"context"
)

type Utils struct {
	ctx context.Context
	path string
}

func (a *Utils) startup(ctx context.Context) {
	a.ctx = ctx
}


