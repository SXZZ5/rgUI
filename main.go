package main

import (
	backend "rgUI/backend"

	"context"
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
    // "github.com/wailsapp/wails/v2/pkg/runtime"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := &backend.App{}
	config := &backend.Config{}
	fops := &backend.Fops{}
	registryManager := &backend.RegistryOptions{}

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
			app.Startup(ctx)
			config.Startup(ctx)
			fops.Startup(ctx)
			registryManager.Startup(ctx)
            // runtime.WindowCenter(ctx)
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

// package main

// import (
// 	backend "rgUI/backend"

// 	"context"
// 	"embed"
// 	"log"
// 	"os"
// 	"runtime/pprof"
// 	"runtime"
// 	"net/http"
// 	hpprof "net/http/pprof"

// 	"github.com/wailsapp/wails/v2"
// 	"github.com/wailsapp/wails/v2/pkg/options"
// 	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
// 	"github.com/wailsapp/wails/v2/pkg/options/windows"
// )

// //go:embed all:frontend/dist
// var assets embed.FS

// func main() {
// 	// Start CPU profiling
// 	cpuFile, err := os.Create("cpu.prof")
// 	if err != nil {
// 		log.Fatal(err)
// 	}
// 	defer cpuFile.Close()
// 	if err := pprof.StartCPUProfile(cpuFile); err != nil {
// 		log.Fatal(err)
// 	}
// 	defer pprof.StopCPUProfile()

// 	// Enable memory profiling
// 	memFile, err := os.Create("mem.prof")
// 	if err != nil {
// 		log.Fatal(err)
// 	}
// 	defer memFile.Close()

// 	// Create a new mux for pprof
// 	mux := http.NewServeMux()
// 	// Register pprof handlers
// 	mux.HandleFunc("/debug/pprof/", http.HandlerFunc(hpprof.Index))
// 	mux.HandleFunc("/debug/pprof/cmdline", http.HandlerFunc(hpprof.Cmdline))
// 	mux.HandleFunc("/debug/pprof/profile", http.HandlerFunc(hpprof.Profile))
// 	mux.HandleFunc("/debug/pprof/symbol", http.HandlerFunc(hpprof.Symbol))
// 	mux.HandleFunc("/debug/pprof/trace", http.HandlerFunc(hpprof.Trace))

// 	// Start HTTP server for real-time profiling
// 	go func() {
// 		log.Println("Starting pprof server on :6060")
// 		log.Println(http.ListenAndServe("localhost:6060", mux))
// 	}()

// 	// Create an instance of the app structure
// 	app := &backend.App{}
// 	config := &backend.Config{}
// 	fops := &backend.Fops{}
// 	registryManager := &backend.RegistryOptions{}

// 	// Create application with options
// 	err = wails.Run(&options.App{
// 		Title:  "rgui",
// 		Width:  900,
// 		Height: 550,
// 		AssetServer: &assetserver.Options{
// 			Assets: assets,
// 		},
// 		Frameless: true,
// 		MinHeight: 500,
// 		MinWidth:  650,
// 		OnStartup: func(ctx context.Context) {
// 			app.Startup(ctx)
// 			config.Startup(ctx)
// 			fops.Startup(ctx)
// 			registryManager.Startup(ctx)
// 		},
// 		OnShutdown: func(ctx context.Context) {
// 			// Write memory profile when application shuts down
// 			runtime.GC() // Get up-to-date statistics
// 			if err := pprof.WriteHeapProfile(memFile); err != nil {
// 				log.Fatal("could not write memory profile: ", err)
// 			}
// 		},
// 		Bind: []interface{}{
// 			app,
// 			config,
// 			fops,
// 			registryManager,
// 		},
// 		Windows: &windows.Options{
// 			WebviewIsTransparent: true,
// 			WindowIsTranslucent:  true,
// 			BackdropType:         windows.Acrylic,
// 		},
// 	})

// 	if err != nil {
// 		println("Error:", err.Error())
// 	}
// }