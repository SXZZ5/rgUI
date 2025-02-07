export namespace main {
	
	export class Skinfo {
	    Name: string;
	    Path: string;
	
	    static createFrom(source: any = {}) {
	        return new Skinfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Path = source["Path"];
	    }
	}
	export class Data {
	    Drives: Skinfo[];
	    Pinned: Skinfo[];
	
	    static createFrom(source: any = {}) {
	        return new Data(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Drives = this.convertValues(source["Drives"], Skinfo);
	        this.Pinned = this.convertValues(source["Pinned"], Skinfo);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class SkDirEntry {
	    Name: string;
	    Path: string;
	    Isdir: boolean;
	
	    static createFrom(source: any = {}) {
	        return new SkDirEntry(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Path = source["Path"];
	        this.Isdir = source["Isdir"];
	    }
	}

}

