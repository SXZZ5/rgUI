# File Manager


### NOTE:
- File manager is easy to write but hard to get right. The responsibility of not messing with the user's data no matter what happens is huge. 
- Will have to go down the checksum route I think.
- Will have to spend another day or two on error handling and presentation, stuff like this file already exists, doesn't exist, os did not let me write etc etc. 
- Event based pagination to minimise first contentful paint and thereafter page size can be increased exponentially. 
- React wasn't fast enough at rendering huuuge lists (~20k items). The problem is even with pagination, the total computation is O(n^2) with react even thought the reconciler might manage to keep dom updates O(n). Simply creating the Virutal DOM for every incremental prefix of a paginated list is not so nice for 1e4 magnitudes. 
- Solution was vanilla javascript dom manipulation. Mutation isn't so bad when done right. But, its mixed up with react style ui updates and not sure how buggy it might be, however looks fine as of now. 

