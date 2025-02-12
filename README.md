# File Manager

### Screenshots
![Screenshot 1](md_assets/ss1.svg)
![Screenshot 2](md_assets/ss2.svg)

### Usage
- Alt + Click on file/folder to pin to sidebar. Alt + Click on a sidebar item to unpin it.
- Ctrl + Click to select a file/folder. 
- Shift + Delete actually deletes things. Only clicking Delete moves things to recycle bin (windows only)
- Shift + Paste overwrites existing files in case of conflicts. Only Paste notifies of conflicts and cancels the transfers.
- Scroll horizontally over the buttons region on the bottom of scrollbar to resize the sidebar.
- Moving windows around should be done by grabbing the pill button on the titlebar.
- Red: quit, yellow: minimise, green: maximise
- Order defaults to lexical order with dotfiles and hidden files placed at the end.

### Why 
- can't stand how windows explorer starts jittering randomly.
- simplicity. 
- pretty sidebar. tasty transparency.

### Bugs:
- *You tell me :)*
- expect css inconsistencies.

### Notes/Todos:
- File manager is easy to write but hard to get right. The responsibility of not messing with the user's data no matter what happens is huge. 
- TODO: Search features
- TODO: Icon packs maybe
- ~~TODO: Implement checksums to ensure data integrity before finishing any operations.~~
- ~~TODO: Error presentation, file could not be opened, os did not allow write etc etc.~~
- Event based pagination to minimise first contentful paint and thereafter page size can be increased exponentially. 
- React wasn't fast enough at rendering huuuge lists (~20k items). The problem is even with pagination, the total computation is O(n^2) with react even thought the reconciler might manage to keep dom updates O(n). Simply creating the Virutal DOM for every incremental prefix of a paginated list is not so nice for 1e4 magnitudes. 
- Solution was vanilla javascript dom manipulation. Mutation isn't so bad when done right. But, its mixed up with react style ui updates and not sure how buggy it might be, however looks fine as of now. 
- If you really want to be crazy about it, node pooling is also a thing. 

