package main

import (
	"context"
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := &App{}
	config := &Config{}
	fops := &Fops{}
	// skDirEntry := &SkDirEntry{}

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "rgui",
		Width:  1024,
		Height: 650,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		Frameless: true,
		MinHeight: 500,
		MinWidth:  650,
		OnStartup: func(ctx context.Context) {
			app.startup(ctx)
			// skDirEntry.startup(ctx);
			config.startup(ctx)
			fops.startup(ctx)
		},
		Bind: []interface{}{
			app,
			config,
			fops,
			// skDirEntry,
		},
		EnableDefaultContextMenu: false,
		Windows: &windows.Options{
			WebviewIsTransparent: true,
			WindowIsTranslucent:  true,
			BackdropType:         windows.Acrylic,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
