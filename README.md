# File Manager


### NOTEs/TODOS:
- File manager is easy to write but hard to get right. The responsibility of not messing with the user's data no matter what happens is huge. 
- TODO: Implement checksums to ensure data integrity before finishing any operations.
- TODO: Error presentation, file could not be opened, os did not allow write etc etc.
- Event based pagination to minimise first contentful paint and thereafter page size can be increased exponentially. 
- React wasn't fast enough at rendering huuuge lists (~20k items). The problem is even with pagination, the total computation is O(n^2) with react even thought the reconciler might manage to keep dom updates O(n). Simply creating the Virutal DOM for every incremental prefix of a paginated list is not so nice for 1e4 magnitudes. 
- Solution was vanilla javascript dom manipulation. Mutation isn't so bad when done right. But, its mixed up with react style ui updates and not sure how buggy it might be, however looks fine as of now. 
- If you really want to be crazy about it, node pooling is also a thing. 

