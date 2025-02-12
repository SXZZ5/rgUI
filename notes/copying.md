- I think what I have found is that io.Copybuffer call me io.Writer aur io.Reader interfaces chahiye sahi hai. 
- Ab io.Writer aur io.Reader ko implement karne wala jo bhi hai do entities chalega. Inme se the thing is jo base writer/readers hain jaise os.File ke un sabka default buffer size hota hai jitna wo read karta hai ek chunk me. 
- Now suppose you gave a custom io.Writer to the CopyBuffer function ekdum mast bada sa 1Mb buffer de ke but io.Reader is simply a normal os.File. You might think that you are getting 1Mb read/write chunks what you will actually get is the chunk size of the smaller of the two (io.Writer and io.Reader).
- To pate ki baat ye hai matlab ki 1Mb ka write buffer but 32kb ka default os.File read buffer means you are actually only getting 32kb chunks.

- Basically hota aisa hai ki tumne jo buffer diya hai wo io.CopyBuffer use to sach me kar rha hai.
- Lekin uss buffer ko usne bheja io.Read ko. io.Read apni taraf se poori koshish karta hai poora buffer bhar ke bheje wapas.
- but lets say wo poora nahi bhar paya for whatever reason. Ab write side pe data bhejn time, io.CopyBuffer sirf utni prefix hi bhejta hai io.Read ne read kara tha (as shown by the n value returned). 

- Basically hota aisa hai ki tumne jo buffer diya hai wo io.CopyBuffer use to sach me kar rha hai.
- Lekin uss buffer ko usne bheja io.Read ko. io.Read apni taraf se poori koshish karta hai poora buffer bhar ke bheje wapas.
- 
- 

### CONCLUSION
- conclusion ye hai ki agar ek bhi base implementations of io.Reader ya io.Writer like os.File diya io.CopyBuffer ko to bhaad me jayega tumhara diya hua buffer size, read/write chunks base implementation ki marzi se hi ho rha hai.
- dono ke dono agar custom implementations doge io.Reader and io.Writer ke tab wo tumhare huye buffer size ko respect karega aur tumhare bataye huye chunks me read/write karega.

- isse bhangde se accha tha manually os.Read and os.Write karke copy simulate kar leta par ab khair dobara nahi likhunga bohot ho gaya.