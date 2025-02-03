package main

import (
	"embed"
	"context"
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
	utils := &Utils{}
	config := &Config{}

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "rgui",
		Width:  1024,
		Height: 650,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		Frameless: true,
		OnStartup: func (ctx context.Context) {
			app.startup(ctx);
			utils.startup(ctx);
			config.startup(ctx);
		},
		Bind: []interface{}{
			app,
			utils,
			config,
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
