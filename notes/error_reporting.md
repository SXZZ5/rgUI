- os.Walkdir ke baad jo final "files" ki list hai uspe error manage karte hain. ("files" because directories pehle hi bana lunga isme to kya hi error aayega, aur error aa bhi gaya aur ignore kar diya to bhi uss directory ki files automatically destination path does not exist kar hi dengi)

Current structure is as follows:
- caller.ToMove ki list me iterate karo.
- file mile to alag list me store karlo, directory mile to alag me store karlo.
- directories jo mili thi unko pakdo. Aur un saari directories pe walkdir kardo.
- walkdir me fir aur directories milengi aur unke andar ki saari files bhi milengi. Files ko files waali list me daal lo aur directories ko directories wali me. 
- ab saari directories ko os.MkdirAll karke call kardo (agar foo/bar/zeto path hai aur bar nhi exist karta to khud bana lega).
- saari directories banne ke baad ab files ki list pe iterate karke transfer karna chalu kara. 
- each file <=> unit of Work. Work => File Src path, File destination path (relative to pasting destination), Status integer.
- File destination path ko leke you have to be slightly careful. foo/bar/zeto.md ko destination path is root_pasting_location/foo/bar/zeto.md. Agar to default behaviours (truncate if anything already exists) pe ho tab to zero ka parent path /foo/bar humesha rahega so actual file zoo.md likhte samay things are simple. 

##### Relative paths ke baare me be careful 
- basically the assumption is ki Ek SRC_ROOT location se DEST_ROOT pe transfers hone hain. 
- for each file, its destination is obtained as follows: 
    - CutPrefix(SRC_ROOT, absolute_src_path_of_file). 
    - Now prepend DEST_ROOT to the path.

##### Types of reportable errors / choices
- destination file creation error
- srcfile opening for reading error. 
- error during the copying of some file.
- file already exists error. 
- error in removing some file.

**In terms of code**
- os.Stat on some src item me error => src file/folder me error => report at the end.
- os.Stat is non-nil for some destination file => replace nhi karna to error => report at the end.
- WalkDir me error => current subfolder ki saari files skip kar do => report at the end.
- CustomWriter ke write me error, CustomReader ke read me error. Ya Copybuffer ka error khud.

##### ERROR structure ko aisa kar lo fir
- Stat errors => src entity not found errors and walkdir errors
- Read/Write errors => end moment pe files opening/creating me error, checksum mismatch error, writing error.

TODO: 
- Choosing to overwrite or keep original in case of something already exists is tricky. 
Aisa karo auto renaming mai nhi kar rha handle. Do flags de do user ko ya to auto rename karna hai ya nhi karna hai. Agar auto rename nahi karna hai then every directory or file that already exists is just another error to report. **Mai renaming nahi kar rha basically bas, ya to overwrite kara lo ya to skip kara lo**

TODO:
- jab end of the day baar gen_dest calls karoge hi jisme root_dest_path copy hoyega hi final path construct karne ko, to fir kya hi memory bacha li common prefix centralise kar ke paths se. 

