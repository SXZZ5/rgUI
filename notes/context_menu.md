- duniya bhar ki buddhi lagane ke baad aur msdn pe maatha fodne ke baad I have decided to giveup on getting the list of context menu items that should exist at a path from the OS.
- what I did learn though was sabkuch registry me likha hua hota hai. Kaunsi file types ko kis application se khola jaa sakta hai iske liye har file type ke corresponding ek apps khudko register karwa ke entry karwate hain. 
- To apan seedha registry read karne ka try karte hain, kyunki ye COM aur SHELL api ekdum sar dard hai.

- File extensions ke hissaab se relevant apps milenge at CLASSES_ROOT/.extension/OpenWithProgids/AppName.extension.
- Folder open karne ke options are found at CLASSES_ROOT/Directory/shell

- RegOptions struct ko App startup pe bind kar do js se.
- Right Click pe MenuProvider call kar lo. MenuProvider regoptions struct ka keyNames []string field return kar dega.
- Frontend pe list ko render kar do. aur index yaad rakho har item ki. 
- item onClick pe Executor ko call karlo aur item ki index de do bas.

#### WHAT DOES NOT WORK
- Some files types have assosciations with weird encoded names instead of simple ProgIds Go knows what they are supposed to launch. 
- Some applications register themselves with some customised protocols instead of giving providing a progID and default command. Such methods of opening a file via customised protocols does not work.

