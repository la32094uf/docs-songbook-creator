# docs-songbook-creator
Google sheet and docs script to create a songbook


With this google sheet, you create a google-docs songbook for campfire-songs.
You can choose which songs to include, if it is a broad lyric, small lyric, long lyric etc. 
Also you can decide to put a lyric on a new page.

Any comments / commits are appreciated. 



Your google sheet have to look like this:

NameSong,Text,AddInBundle,BroadOrSmall,LongOrShort,Seq,Check,Number of lines,Broadest line,ContentOfBroadestLine,Add as a new page

Column A (Name): contains the title of your song
Column B (Lyric): contains the lyrics of the song
Column C (AddinBundle): should it be in the bundle (YES/NO)
Column D (BroadOrSmall): Is this a broad or small lyric (BROAD/SMALL)
Column E (LongOrShort): Is it a long or short lyric
Column F (Sequential number): =IF(OR(E2="Lang",D2="Breed"),0,INDIRECT(ADDRESS(ROW()-1, COLUMN()))+1)
Column G (Check): =IF(OR(INDIRECT(ADDRESS(ROW(), COLUMN()-2))="Lang",INDIRECT(ADDRESS(ROW(), COLUMN()-3))="Breed"),IF(ISODD(INDIRECT(ADDRESS(ROW()-1, COLUMN()-1))),"Niet Goed",""),"")
Column H (NoL): =IF(B2="", 0, LEN(B2) - LEN(SUBSTITUTE(B2, CHAR(10), "")) + 1)
Column I (BrL): =LEN(ARRAYFORMULA(INDEX(SPLIT(B2, CHAR(10)), MATCH(MAX(LEN(SPLIT(B2, CHAR(10)))), LEN(SPLIT(B2, CHAR(10))), 0))))
Column J (CoBL): =ARRAYFORMULA(INDEX(SPLIT(B2, CHAR(10)), MATCH(MAX(LEN(SPLIT(B2, CHAR(10)))), LEN(SPLIT(B2, CHAR(10))), 0)))
Column K (Newpage) Should it start with a pagebreak usage: "New page"


