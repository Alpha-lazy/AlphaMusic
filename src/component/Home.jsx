import React, { useEffect, useState } from 'react'
import '../index.css'
import axios from 'axios'
import { map } from 'zod';
import { set } from 'mongoose';

let prevsong;
let currentIndex = 0;
let currentaudio = new Audio();

function Home() {
const[value,setValue] = useState('0')
const[search,setSearch] = useState('top 2024')
const[playlistsearch,setPlaylistsearch] = useState('top playlist')
const[song,setSong] = useState([])
const[currentSong,setCurrentsong] = useState([])
const[sugesstion, setSugesstion] = useState([])
const[click,setClick] = useState(false)
const[playlist,setPlaylist] = useState([])
const[playlistSong,setPlaylistSong] = useState([])
const[playlistSongTrack,setPlaylistSongTrack] = useState([])
const[audidownload,setDownload] = useState()
function handleonchange (e){

  setSearch(`${e.target.value}`)
  setPlaylistsearch(`${e.target.value}`)
   

   console.log(playlistsearch.length);
   
 
   
    axios.get('https://saavn.dev/api/search/songs', {
      params: {
        query: search.trim().length===0||search.length===1?"top 2024":search, // Pass parameters to the request
        limit:30
      },
    })
    .then((response) => {
      setSong(response.data.data.results)
      
  
  })

  axios.get('https://saavn.dev/api/search/playlists',{
    params:{
      query:playlistsearch.trim().length===0||playlistsearch.length===1?"top playlist":`${playlistsearch}`,
      limit:50
    }
  })
  .then((response)=>{
    setPlaylist(response.data.data.results)
    
    
  })
}
useEffect(()=>{
  axios.get('https://saavn.dev/api/search/songs', {
    params: {
      query: search.trim().length===0||search.length===1?"Top 2024":`${search}`, // Pass parameters to the request
      limit:30
    },
  })
  .then((response) => {
    setSong(response.data.data.results)
 
  })

  axios.get('https://saavn.dev/api/search/playlists',{
    params:{
    query:search.trim().length===0||playlistsearch.length===1?"top playlist":`${playlistsearch}`,
      limit:50
    }
  })
  .then((response)=>{
    setPlaylist(response.data.data.results)   
  })
},[])



 async function playsong(id){

//  const id  = e.currentTarget.id

 if (currentaudio.played) {
  document.getElementById('play').style.display = 'none'
  document.getElementById('pause').style.display = 'block'
 
}




 await axios.get('https://saavn.dev/api/songs', {
    params: {
      ids:id
    },
  })
  .then(async(response) => {
    await axios.get('https://saavn.dev/api/songs', {
      params: {
        ids:id
      },
    })
    .then(async(response) => {
    setCurrentsong(await response.data.data[0])
   
    let download = await  fetch(response.data.data[0].downloadUrl[4].url)
    setDownload(await download.blob()) 
 

      currentaudio.src = response.data.data[0].downloadUrl[4].url
      // if (currentaudio.src !== response.data.data[0].downloadUrl[4].url ) {

          // currentaudio.pause()
          // currentaudio.preload = 'auto'
          currentaudio.load()
      //     currentaudio.currentTime = 0
      // }
      currentaudio.play()


   
 
    if (playlistSong.length==0) {
      
   
    await axios.get('https://saavn.dev/api/search/songs', {
      params: {
        query:response.data.data[0].artists.all[0].name, // Pass parameters to the request
        limit:100
      },
    
    })
    
    .then(async(response) => {
      let data = await response.data.data.results
      setSugesstion(data)
     
      
    
    })
  }
  else{
    setSugesstion(song)
  }
})
  

      
    setClick(true)
    setInterval(async() => {
      

      // console.log(Math.floor(await response.data.data[0]));
      
      document.getElementById('current-time').innerHTML = `${convertToMMSS(Math.floor(currentaudio.currentTime))}`
      document.getElementById('duration-time').innerHTML = `${isNaN(currentaudio.duration)?"00:00":convertToMMSS(Math.floor(currentaudio.duration))}`
     
      

   if(currentaudio.played) {
      document.getElementById('play').style.display = 'block'
      document.getElementById('pause').style.display = 'none'
    
    }
     else{

      document.getElementById('play').style.display = 'none'
      document.getElementById('pause').style.display = 'block'
    
  }

       let value = currentaudio.currentTime/currentaudio.duration*100;
        if(currentaudio.played) {
      document.getElementById('play').style.display = 'none'
      document.getElementById('pause').style.display = 'block'
    
    }
     if (currentaudio.paused){

      document.getElementById('play').style.display = 'block'
      document.getElementById('pause').style.display = 'none'
    
  }
  
     
      document.getElementById('progressBar').value = Math.floor(currentaudio.currentTime/currentaudio.duration*100)
     

      document.getElementById('progressBar').style.background = `linear-gradient(to right,   rgb(255, 255, 255) ${value}%,  rgba(153, 153, 153, 0.774) ${value}%)`;
   
 }, 1000);

 


})


}
// console.log(song);








 function Progress(e) {
   let value = e.target.value; 
   setValue(value)
   let max = e.target.max;
   let percentage = Math.floor(value/max*100);  
   currentaudio.currentTime = currentaudio.duration/100*value
   document.getElementById('progressBar').style.background = `linear-gradient(to right,   rgb(255, 255, 255) ${percentage}%,  rgba(153, 153, 153, 0.774) ${percentage}%)`;
   
 }     

 function convertToMMSS(seconds) {

   
  // Calculate minutes
  const minutes = Math.floor(seconds / 60);
  // Calculate remaining seconds
  const remainingSeconds = seconds % 60;
  // Pad with leading zero for single-digit seconds
  const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
  // Return formatted string
  return `${minutes}:${formattedSeconds}`;



}

currentaudio.addEventListener('ended',async()=>{
if (playlistSong.length!==0) {
  setSugesstion(song)
  if (document.getElementById('shuffleOn').style.display === 'block') {
    currentIndex = Math.floor(Math.random()*playlistSongTrack.length)
    setCurrentsong(playlistSongTrack[currentIndex])
    currentaudio.src = playlistSongTrack[currentIndex].downloadUrl[4].url
   //  currentaudio.play()
}
else{
 currentIndex = playlistSongTrack.findIndex((item) => item.id ===currentSong.id)+1
 setCurrentsong(playlistSongTrack[currentIndex])
 

   

 currentaudio.src = await playlistSongTrack[currentIndex].downloadUrl[4].url
 // currentaudio.play()
}
currentaudio.load()
await currentaudio.play()
let download = await  fetch(playlistSongTrack[currentIndex].downloadUrl[4].url)

setDownload(await download.blob()) 
// let download = await fetch(playlistSongTrack[currentIndex].downloadUrl[4].url)
// setDownload(await download.blob())
// console.log(download.blob());

}
else{
  if (document.getElementById('shuffleOn').style.display === 'block') {
    currentIndex = Math.floor(Math.random()*sugesstion.length)
    setCurrentsong(sugesstion[currentIndex])
    currentaudio.src = sugesstion[currentIndex].downloadUrl[4].url
   //  currentaudio.play()
}
else{
 currentIndex = sugesstion.findIndex((item) => item.id ===currentSong.id)+1
 setCurrentsong(sugesstion[currentIndex])
 

   

 currentaudio.src = await sugesstion[currentIndex].downloadUrl[4].url
 // currentaudio.play()
}
currentaudio.load()
await currentaudio.play()
let download = await fetch(sugesstion[currentIndex].downloadUrl[4].url)
setDownload(await download.blob())

}
})

function playpause() {

  if (currentaudio.paused){

      document.getElementById('play').style.display = 'none'
      document.getElementById('pause').style.display = 'block'
     currentaudio.play()
  }
   else {
      document.getElementById('play').style.display = 'block'
      document.getElementById('pause').style.display = 'none'
      currentaudio.pause()
    }
}

async function next() {
if (playlistSong.length!==0) {
  if (document.getElementById('shuffleOn').style.display === 'block') {
    currentIndex = Math.floor(Math.random()*playlistSongTrack.length)
    setCurrentsong(playlistSongTrack[currentIndex])
    currentaudio.src = playlistSongTrack[currentIndex].downloadUrl[4].url
    currentaudio.load()
    // currentaudio.play()
}else{
  setSugesstion(song)
  currentIndex = playlistSongTrack.findIndex((item) => item.id ===currentSong.id)+1
  setCurrentsong(await playlistSongTrack[currentIndex])
   
  currentaudio.src =await playlistSongTrack[currentIndex].downloadUrl[4].url
  //  document.getElementById('duration-time').innerHTML = `${convertToMMSS(Math.floor(sugesstion[currentIndex].duration))}`
 
  currentaudio.load()
  // currentaudio.play()
}
currentaudio.play()
}
else{
  if (document.getElementById('shuffleOn').style.display === 'block') {
    currentIndex = Math.floor(Math.random()*sugesstion.length)
    setCurrentsong(sugesstion[currentIndex])
    currentaudio.src = sugesstion[currentIndex].downloadUrl[4].url
    currentaudio.load()
    // currentaudio.play()
}
else{
 currentIndex = sugesstion.findIndex((item) => item.id ===currentSong.id)+1
 setCurrentsong(await sugesstion[currentIndex])
  
 currentaudio.src =await sugesstion[currentIndex].downloadUrl[4].url
 //  document.getElementById('duration-time').innerHTML = `${convertToMMSS(Math.floor(sugesstion[currentIndex].duration))}`

 currentaudio.load()
//  currentaudio.play()
}
currentaudio.play()
}



  if (currentIndex===sugesstion.length) {
    document.getElementById('next').style.cursor = ' not-allowed'
     document.getElementById('next').style.display = 'none'
  }
  else{
    document.getElementById('prev').style.display = 'block'
    document.getElementById('next').style.cursor = 'pointer'
  }

 


  if (currentIndex===sugesstion.length) {
    document.getElementById('next').style.cursor = ' not-allowed'
     document.getElementById('next').style.display = 'none'
  }
  else{
    document.getElementById('next').style.cursor = 'pointer'
    document.getElementById('prev').style.display = 'block'
  }

  // console.log( song.findIndex((item) => item.id ===response.data.data[0].id ));
  // setCurrentsong(await sugesstion[currentIndex])
  
  // currentaudio.src =await sugesstion[currentIndex].downloadUrl[4].url
  // //  document.getElementById('duration-time').innerHTML = `${convertToMMSS(Math.floor(sugesstion[currentIndex].duration))}`
  // console.log(convertToMMSS(Math.floor(sugesstion[currentIndex].duration)));
  // console.log(sugesstion[currentIndex]);
  
  
  // currentaudio.play()
 
  
  // playsong(currentSong.id)
}
async function prev() {
  if (playlistSong.length!==0) {
    if (document.getElementById('shuffleOn').style.display === 'block') {
      currentIndex = Math.floor(Math.random()*playlistSongTrack.length)
      setCurrentsong(playlistSongTrack[currentIndex])
      currentaudio.src = playlistSongTrack[currentIndex].downloadUrl[4].url
      currentaudio.load()
      // currentaudio.play()
  }else{
    setSugesstion(song)
    currentIndex = playlistSongTrack.findIndex((item) => item.id ===currentSong.id)-1
    setCurrentsong(await playlistSongTrack[currentIndex])
     
    currentaudio.src =await playlistSongTrack[currentIndex].downloadUrl[4].url
    //  document.getElementById('duration-time').innerHTML = `${convertToMMSS(Math.floor(sugesstion[currentIndex].duration))}`
    currentaudio.load()
    
    // currentaudio.play()
  }
  currentaudio.play()
  }
  else{
  if (playlistSong.length!==0) {
    setSugesstion(song)
  }
  if (document.getElementById('shuffleOn').style.display === 'block') {
    currentIndex = Math.floor(Math.random()*sugesstion.length)
    setCurrentsong(sugesstion[currentIndex])
    currentaudio.src = sugesstion[currentIndex].downloadUrl[4].url
    currentaudio.load()
    // currentaudio.play()
}
else{
  currentIndex = sugesstion.findIndex((item) => item.id ===currentSong.id)-1
  setCurrentsong(await sugesstion[currentIndex])

  currentaudio.src =await sugesstion[currentIndex].downloadUrl[4].url
  //  document.getElementById('duration-time').innerHTML = `${convertToMMSS(Math.floor(sugesstion[currentIndex].duration))}`
 
  currentaudio.load()
 
//  currentaudio.play()
}
currentaudio.play()
}
  if (currentIndex===0) {
    document.getElementById('prev').style.cursor = ' not-allowed'
    document.getElementById('prev').style.display = 'none'
  }
  else{
    document.getElementById('prev').style.cursor = 'pointer'
    document.getElementById('next').style.display = 'block'
  }
  currentIndex =  sugesstion.findIndex((item) => item.id ===currentSong.id)-1

  
  if (currentIndex===-1) {
    currentIndex=3
    document.getElementById('prev').style.cursor = ' not-allowed'
    document.getElementById('prev').style.display = 'none'
  }
  else{
    document.getElementById('prev').style.cursor = 'pointer'
    document.getElementById('next').style.display = 'block'
  }

  // sugesstion[1]
  // // console.log( song.findIndex((item) => item.id ===response.data.data[0].id ));
  // setCurrentsong(sugesstion[currentIndex])
  
  // currentaudio.src =await sugesstion[currentIndex].downloadUrl[4].url
  // currentaudio.play()
 
  
  // playsong(currentSong.id)
}


function loop() {
    if (currentaudio.loop) {
        document.getElementById('loopOn').style.display = 'none';
        document.getElementById('loopOff').style.display = 'block';
         currentaudio.loop = false
    }
    else{
      document.getElementById('loopOn').style.display = 'block';
      document.getElementById('loopOff').style.display = 'none';
      currentaudio.loop = true
    }
}


function shuffle() {
     if(document.getElementById('shuffleOn').style.display!=='block'){
            document.getElementById('shuffleOn').style.display='block'
            document.getElementById('shuffleOff').style.display='none'
          
           
     }
     else{
      document.getElementById('shuffleOn').style.display='none'
      document.getElementById('shuffleOff').style.display='block'
     }
 
}


function scrollUp() {
  const container = document.getElementById('playlist');
  container.scrollBy({ left: -500, behavior: 'smooth' });
}

function scrollDown() {
  const container = document.getElementById('playlist');
  container.scrollBy({ left: 500, behavior: 'smooth' });
}


// useEffect(()=>{

// const container = document.getElementById('playlist');
// container.addEventListener('wheel', (event) => {
//   event.preventDefault(); // Prevent default vertical scrolling
//   container.scrollLeft += event.deltaY; // Scroll horizontally using the vertical scroll delta
// }, { passive: false });
  
// })

 async function download(audiolink,fileName) {
  
  // let download = await  fetch(audiolink)

      // const url = window.URL.createObjectURL(await download.blob()) 
      const url = window.URL.createObjectURL(audidownload) 
      const link = document.createElement('a');
      console.log(url);
      
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);  // Clean up memory
 }

 async function playPlaylist(id,url) {

   await axios.get('https://saavn.dev/api/playlists',{

    params:{
        id:id,
        link:url,
        limit:"100"
    }
  })
    .then(async(responce)=>{
     
        
      setPlaylistSong(responce.data.data)
      setPlaylistSongTrack(await responce.data.data.songs)
      setCurrentsong(await responce.data.data.songs[0])
      setClick(true)
      currentaudio.src = responce.data.data.songs[0].downloadUrl[4].url
      currentaudio.play()
      document.getElementById("front").style.display = "none"
      document.getElementById("playlistcont").style.display = "block"
             
    })

    setInterval(async() => {
     

    // console.log(Math.floor(await response.data.data[0]));
    // console.log(playlistSongTrack.filter(playlistSongTrack => playlistSongTrack.id==id)[0].id);
    // console.log( document.querySelectorAll(`#${playlistSongTrack.filter(playlistSongTrack => playlistSongTrack.id==id)[0].id}`)[1].style.backgroundColor="red");
    
 

   
    
    
    document.getElementById('current-time').innerHTML = `${convertToMMSS(Math.floor(currentaudio.currentTime))}`
    document.getElementById('duration-time').innerHTML = `${isNaN(currentaudio.duration)?"00:00":convertToMMSS(Math.floor(currentaudio.duration))}`
    // document.getElementById('duration-time').innerHTML = `${currentaudio.played?convertToMMSS(Math.floor(currentaudio.duration)):"00:00"}`

   
    if(isNaN(currentaudio.duration)){
      let value = 0
      document.getElementById('progressBar').style.background = `linear-gradient(to right,   rgb(255, 255, 255) ${value}%,  rgba(153, 153, 153, 0.774) ${value}%)`;
    }
     else{
      let value = currentaudio.currentTime/currentaudio.duration*100;
      document.getElementById('progressBar').value = Math.floor(currentaudio.currentTime/currentaudio.duration*100)
      document.getElementById('progressBar').style.background = `linear-gradient(to right,   rgb(255, 255, 255) ${value}%,  rgba(153, 153, 153, 0.774) ${value}%)`;
     }
   
    
   if(currentaudio.played) {
      document.getElementById('play').style.display = 'none'
      document.getElementById('pause').style.display = 'block'
    
    }
     if (currentaudio.paused){

      document.getElementById('play').style.display = 'block'
      document.getElementById('pause').style.display = 'none'
    
  }
}, 1000); 

    
 }
 



 async function PlayPlaylistSong(id,row) {

            document.getElementById('play').style.display = 'none'
      document.getElementById('pause').style.display = 'block'

  let url = await playlistSongTrack.filter(playlistSongTrack => playlistSongTrack.id==id)[0].downloadUrl[4].url
  
  setCurrentsong(playlistSongTrack.filter(playlistSongTrack => playlistSongTrack.id==id)[0])
  currentaudio.src = await url
  // currentaudio.preload = 'auto'
  // playsong(await playlistSongTrack.filter(playlistSongTrack => playlistSongTrack.id==id)[0].id)
  // currentaudio.load()
  currentaudio.play()


  setClick(true)
  prevsong = playlistSongTrack.filter(playlistSongTrack => playlistSongTrack.id==id)[0].id
  let download = await fetch(playlistSongTrack.filter(playlistSongTrack => playlistSongTrack.id==id)[0].downloadUrl[4].url)
  setDownload(await download.blob())
  setInterval(async() => {
     

    // console.log(Math.floor(await response.data.data[0]));
    // console.log(playlistSongTrack.filter(playlistSongTrack => playlistSongTrack.id==id)[0].id);
    // console.log( document.querySelectorAll(`#${playlistSongTrack.filter(playlistSongTrack => playlistSongTrack.id==id)[0].id}`)[1].style.backgroundColor="red");
    
 
   let run = await convertToMMSS(Math.floor(currentaudio.duration))
   console.log(await currentaudio.duration);
   
    
    
    document.getElementById('current-time').innerHTML = `${convertToMMSS(Math.floor(currentaudio.currentTime))}`
    document.getElementById('duration-time').innerHTML = `${isNaN(currentaudio.duration)?"00:00":convertToMMSS(Math.floor(currentaudio.duration))}`
    // document.getElementById('duration-time').innerHTML = `${currentaudio.played?convertToMMSS(Math.floor(currentaudio.duration)):"00:00"}`

   
    if(isNaN(currentaudio.duration)){
      let value = 0
      document.getElementById('progressBar').style.background = `linear-gradient(to right,   rgb(255, 255, 255) ${value}%,  rgba(153, 153, 153, 0.774) ${value}%)`;
    }
     else{
      let value = currentaudio.currentTime/currentaudio.duration*100;
      document.getElementById('progressBar').value = Math.floor(currentaudio.currentTime/currentaudio.duration*100)
      document.getElementById('progressBar').style.background = `linear-gradient(to right,   rgb(255, 255, 255) ${value}%,  rgba(153, 153, 153, 0.774) ${value}%)`;
     }
   
    
   if(currentaudio.played) {
      document.getElementById('play').style.display = 'none'
      document.getElementById('pause').style.display = 'block'
    
    }
     if (currentaudio.paused){

      document.getElementById('play').style.display = 'block'
      document.getElementById('pause').style.display = 'none'
    
  }
}, 1000);
setCurrentsong(playlistSongTrack.filter(playlistSongTrack => playlistSongTrack.id==id)[0])

//   console.log( download.blob());
  
 }
 



 async function close() {
               document.getElementById("front").style.display = "block"
             document.getElementById("playlistcont").style.display = "none"
            await axios.get('https://saavn.dev/api/search/songs', {
              params: {
                query: search==="top trending"?"Top 2024":`${search}`, // Pass parameters to the request
                limit:30
              },
            })
            .then(async(response) => {
              setSong(response.data.data.results)
              
           console.log();
           await axios.get('https://saavn.dev/api/songs', {
            params: {
              ids:currentSong.id
            },
          })
          .then(async(response) => {
          setCurrentsong(await response.data.data[0])
    
   
                await axios.get('https://saavn.dev/api/search/songs', {
                  params: {
                    query:response.data.data[0].artists.all[0].name, // Pass parameters to the request
                    limit:100
                  },
                
                })
                
                .then(async(response) => {
                  let data = await response.data.data.results
                  setSugesstion(data)
                 
                  
                
                })
         
              
              })
           
            })
          
            setPlaylistSong([])
          
 }


 
  return (
    <>
    <div className='container mt-4 d-flex justify-content-between' style={{alignItems:"center",gap:"15px"}}>
      <h5>AlphaMusic</h5>
      <input id='search' className="p-3 mr-sm-2 " onChange={handleonchange} onFocus={() => { document.getElementById('search').style.border = "1px solid white" }} style={{ background: "#242424", color: "white", width: "500px", height: "45px", borderRadius: "50px", border: "none", outline: "none" }} type="search" placeholder="Search song you want..." aria-label="Search" />
    </div>
    
    <div className='container mt-4 main' id='front' style={{height:"auto",maxHeight:"71vh",overflow:"auto",}}>
        
  
          <h3 style={{color:"white"}}>Playlists</h3>
          {/* <div className='button' style={{position:"absolute",zIndex:"2"}}><button style={{width:"50px",height:"50px",border:"none",borderRadius:"50%"}} onClick={scrollUp}>Left</button></div>
          <div className='button' style={{position:"absolute",zIndex:"2"}}><button style={{width:"50px",height:"50px",border:"none",borderRadius:"50%"}}   onClick={scrollDown}>right</button></div> */}
          <div className='mainPlaylist' style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div className='button' id='bt2' style={{zIndex:"2"}}><button onClick={scrollUp}>
          <svg xmlns="http://www.w3.org/2000/svg"  width="30px" height="30px" viewBox="0 0 320 512"><path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg></button ></div>
          
          <div  id='playlist'  style={playlist.length===0?{height:"200px"}:{display:"flex",justifyContent:"space-evenly",flexWrap:"wrap",flexDirection:"column",overflowX:"scroll",height:"350px",width:"100%"}}> 
          {/* <div style={{display:"flex",justifyContent:"space-between",width:"100%"}}>

            
            {/* </div> */}
          {playlist.length===0?<h4 style={{color:"white",textAlign:"center"}}>No any playlist found</h4>:playlist.map((data)=>{
              return <div className="card"  onClick={()=>{playPlaylist(data.id,data.url)}} id={data.id} >
                <img className="card-img-top" src={data.image[2].url} alt="Card image cap" style={{borderRadius:"10px",width:"130px",height:"130px",margin:"auto",marginTop:"10px"}}/>
                <div className="card-body">
                    <h6 className="card-title" style={{color:"white"}}>{data.name}</h6>
                    <p className="card-text" style={{color:"#898686",fontWeight:"500"}}>{data.type}</p>
                </div>
              
            </div>
            
             })}
        
                
          </div>
          
          <div className='button' id='bt1' style={{zIndex:"2",marginLeft:"10px"}} ><button onClick={scrollDown}>
          <svg xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 320 512"><path d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/></svg>
            </button></div>
          </div>
          <h3 style={{color:"white", height:"10px"}}>Trending Songs </h3>
          <div className='mt-4' style={{display:"flex",justifyContent:"space-evenly",flexWrap:"wrap"}}>

            {song.map((data)=>{
              return <div className="card"  onClick={()=>{playsong(data.id)}} id={data.id} >
                <img className="card-img-top" src={data.image[2].url} alt="Card image cap" style={{borderRadius:"10px",width:"130px",height:"130px",margin:"auto",marginTop:"10px"}}/>
                <div className="card-body">
                    <h6 className="card-title" style={{color:"white"}}>{data.name}</h6>
                    <p className="card-text" style={{color:"#898686",fontWeight:"500"}}>{data.artists.all[0].name}</p>
                </div>
             
            </div>
             })}
             </div>
            </div>
            
            <div className='container mt-4 main' id='playlistcont' style={{height:"auto",maxHeight:"71vh",overflow:"auto",}}>
                <div className='mt-4' >
                  <button className='close' style={{float:"right",border:"none",backgroundColor:"transparent",height:"35px",width:"35px",borderRadius:"50%",display:"flex",alignItems:"center"}} onClick={close}>
                  <svg width="25px" height="25px" fill='white' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
                  </button>
                  </div>
                  <div className='mt-5' style={{display:"flex",alignItems:"center",gap:"30px"}}>
                    <div>
                    <img className='playlistimg' width="200px" height="200px" style={{borderRadius:"10px"}} src={playlistSong.length===0?"":playlistSong.image[2].url} alt="" />
                    </div>
                    <div className='playlistname'>
                       <div><h1 style={{color:"white"}}>{playlistSong.name}</h1></div>
                       <div style={{fontSize:"20px",fontWeight:"500",color:"#757575"}}>{playlistSong.songCount} Songs</div>
                    </div>
                  </div>
                  <div className='mt-5' style={{display:"flex",justifyContent:"center"}}>
                  <table style={{borderCollapse:"separate", borderSpacing:"0 5px"}} width="100%">
                      {playlistSongTrack.map((data,index)=>{
                        return  <tr className='PlaylistRow' onClick={()=>{PlayPlaylistSong(data.id,this)}} id={data.id}>
                                 <td className='srNo' style={{width:"48px",textAlign:"center"}}>{index+1}</td>
                                 <td style={{display:"flex",gap:"10px", alignItems:"center"}}><img className='tbimg' width="50px" height="50px" style={{borderRadius:"5px"}} src={data.image[2].url} alt="" />
                                   <div>
                                    <div className='tbname'>{data.name}</div>
                                   <div className='responceArtistName' style={{fontSize:"14px",color:"#898686",fontWeight:"500"}}>{data.artists.all[0].name}</div>
                                   </div>
                                 
                                 </td>
                                 <td className='tbartist'>{data.artists.all[0].name}</td>
                                 <td className='tbduration' style={{width:"48px",textAlign:"center"}}>{convertToMMSS(data.duration)}</td>
                            </tr>
                           
                          })}
                  </table>
                  </div>
                </div>
            
        
       
        <div style={{width:"100%",height:"90px",padding:"5px",backgroundColor:"black",position:"absolute",bottom:"0px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{width:"300px",display:"flex",alignItems:"center",height:"100%",overflow:"hidden"}}>
           {click?<>
                   <img style={{objectFit:"contain",width:"80px",height:"80px",borderRadius:"5px"}} src={currentSong.image[2].url} alt="" />
                      <div style={{marginLeft:"15px"}} >
                      <h6 className="card-title" style={{color:"white",textWrap:"nowrap"}}>{currentSong.name}</h6>
                      <p className="card-text" style={{color:"#898686",fontWeight:"500",textWrap:"nowrap",fontSize:"16px"}}>{currentSong.artists.all[0].name}</p>
                      </div>
                      </>:""
                     }
                      </div>
                    
                     <div style={{width:"600px",height:"100%"}}>
                       <div style={{display:"flex",justifyContent:"space-between",width:"200px",alignItems:"center",margin:"auto"}}>
                       <svg height="17px" width="17px" fill='rgb(179, 179, 179)' onClick={shuffle} id='shuffleOff' data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 16 16" className="Svg-sc-ytk21e-0 dYnaPI"><path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75 13.15.922zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z"></path><path d="m7.5 10.723.98-1.167.957 1.14a2.25 2.25 0 0 0 1.724.804h1.947l-1.017-1.018a.75.75 0 1 1 1.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 1 1-1.06-1.06L13.109 13H11.16a3.75 3.75 0 0 1-2.873-1.34l-.787-.938z"></path></svg>
                       <svg height="17px" width="17px" fill='rgb(30, 215, 96)' onClick={shuffle} id='shuffleOn' data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 16 16" className="Svg-sc-ytk21e-0 dYnaPI"><path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75 13.15.922zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z"></path><path d="m7.5 10.723.98-1.167.957 1.14a2.25 2.25 0 0 0 1.724.804h1.947l-1.017-1.018a.75.75 0 1 1 1.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 1 1-1.06-1.06L13.109 13H11.16a3.75 3.75 0 0 1-2.873-1.34l-.787-.938z"></path></svg>
                       <svg height="20px" width="20px" fill='white' id='prev' onClick={prev} data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 16 16" className="Svg-sc-ytk21e-0 dYnaPI"><path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h1.6z"></path></svg>
                       
                       <div>
                       <svg height="35px" id='play' width="35px" fill='white' onClick={playpause} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c-7.6 4.2-12.3 12.3-12.3 20.9l0 176c0 8.7 4.7 16.7 12.3 20.9s16.8 4.1 24.3-.5l144-88c7.1-4.4 11.5-12.1 11.5-20.5s-4.4-16.1-11.5-20.5l-144-88c-7.4-4.5-16.7-4.7-24.3-.5z"/></svg>
                       <svg height="35px" id='pause' width="35px" fill='white' xmlns="http://www.w3.org/2000/svg" onClick={playpause} viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM224 192l0 128c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-128c0-17.7 14.3-32 32-32s32 14.3 32 32zm128 0l0 128c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-128c0-17.7 14.3-32 32-32s32 14.3 32 32z"/></svg>
                       </div>
                       <svg height="20px" width="20px" fill='white' id='next' onClick={next} data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 16 16" className="Svg-sc-ytk21e-0 dYnaPI"><path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z"></path></svg>
                       <svg height="17px" width="17px" fill='rgb(179, 179, 179)' id='loopOff' data-encore-id="icon" onClick={loop} role="img" aria-hidden="true" viewBox="0 0 16 16" className="Svg-sc-ytk21e-0 dYnaPI"><path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z"></path></svg>
                       <svg height="17px" width="17px" fill='rgb(30, 215, 96)' id='loopOn' data-encore-id="icon" onClick={loop} role="img" aria-hidden="true" viewBox="0 0 16 16" className="Svg-sc-ytk21e-0 dYnaPI"><path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z"></path></svg>
                       </div>
        
                       <div className="spotify-progress" style={{display:"flex",justifyContent:"center",alignItems:"center",marginTop:"10px"}}>
                          <span className="current-time" id='current-time'>00:00</span>
                          <input className='progress-bar' id='progressBar' onChange={Progress} type="range" min="0" max="100" value={value} />
                          <span className="duration-time" id='duration-time'>00:00</span>
                        </div>
               
                     </div>
                     <div style={{display:"flex",justifyContent:"right",alignItems:"center",width:"300px",height:"100%"}}>
                       {click?<button style={{width:"50px",height:"50px", border:"none",backgroundColor:"transparent"}} onClick={()=>{download(currentSong.downloadUrl[4].url,currentSong.name)}}>
                       <svg xmlns="http://www.w3.org/2000/svg" height="20px" width="20px" fill='white' style={{backgroundColor:"transparent"}} viewBox="0 0 512 512"><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg>
                       </button>:""}
                      
                     </div>
            
                    
        </div>
    
    </>
  )
}

export default Home
