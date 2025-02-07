package main

import (
	"context"
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
    "github.com/wailsapp/wails/v2/pkg/runtime"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := &App{}
	config := &Config{}
	fops := &Fops{}
	registryManager := &RegistryOptions{}

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "rgui",
		Width:  900,
		Height: 550,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		Frameless: true,
		MinHeight: 500,
		MinWidth:  650,
		OnStartup: func(ctx context.Context) {
			app.startup(ctx)
			config.startup(ctx)
			fops.startup(ctx)
			registryManager.startup(ctx)
            runtime.WindowCenter(ctx)
		},
		Bind: []interface{}{
			app,
			config,
			fops,
			registryManager,
		},
		// EnableDefaultContextMenu: false,
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
