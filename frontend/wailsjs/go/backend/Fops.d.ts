// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {context} from '../models';

export function AddDoneWork(arg1:number):Promise<void>;

export function AddSelected(arg1:string):Promise<void>;

export function AddTotalWork(arg1:number):Promise<void>;

export function BeginDeletion(arg1:boolean):Promise<void>;

export function BeginTransfer(arg1:string,arg2:boolean):Promise<void>;

export function CopyCommand():Promise<void>;

export function CutCommand():Promise<void>;

export function FileLogger(arg1:Array<any>):Promise<void>;

export function FileRenamer(arg1:string,arg2:string):Promise<boolean>;

export function GetDirEvents(arg1:string):Promise<void>;

export function GetParent(arg1:string):Promise<string>;

export function RemoveAllSelected():Promise<void>;

export function RemoveSelected(arg1:string):Promise<void>;

export function Renamer(arg1:string,arg2:string):Promise<void>;

export function Startup(arg1:context.Context):Promise<void>;
