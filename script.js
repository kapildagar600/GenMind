//1.
const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion-list .suggestion");
const toggleThemeButton = document.querySelector("#toggle-theme-button");
const deleteChatButton = document.querySelector("#delete-chat-button");



let userMessage = null;
let isResponseGenerating = false;
//ApI configuration
const YOUR_API_KEY = "AIzaSyDgtoPmp7WAESI25LkwHixh1M9ajFJ49QM";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${YOUR_API_KEY}`;

const loadLocalstorageData = ()=>{
    const savedChats = localStorage.getItem("savedChats")

    //restore saved chats
    chatList.innerHTML = savedChats || "";
    document.body.classList.toggle("hide-header",savedChats);
}
loadLocalstorageData();

//create a new msg element and return it
const createMessageElement =(content,...classes)=>{
    const div = document.createElement("div");
    div.classList.add("message",...classes);
    div.innerHTML = content;
    return div;
}
//showing typing effects by displaying words one by one
const showTypingEffect = (text, textElement, incomingMessageDiv) => {
    const words = text.split(' ');
    let currentWordIndex = 0;
    const typingInterval = setInterval(()=>{
        //append each word to the text element with space
        textElement.innerText+= (currentWordIndex===0 ? '' : ' ') + words[currentWordIndex++];

        incomingMessageDiv.querySelector(".icon").classList.add("hide");
        //if all words are displayed
        if(currentWordIndex===words.length){
            clearInterval(typingInterval);
            isResponseGenerating = false;
            incomingMessageDiv.querySelector(".icon").classList.remove("hide");
            localStorage.setItem("savedChats",chatList.innerHTML);// save chats to local storage
        }
    },75);
}
//Fetch the response from API based on user message
const generateAPIResponse = async (incomingMessageDiv)=>{

    const textElement = incomingMessageDiv.querySelector(".text");//get text element

    //send post request to API with user message
try{
    const response = await fetch(API_URL,{
        method: "POST",  
        headers: {"Content-Type": "application/json"} ,
        body:JSON.stringify({
            contents: [{
                role:"user",
                parts:[{text: userMessage}]
            }] 
        })

    });

    const data = await response.json();
    if(!response.ok) throw new Error(data.error.message);
   
    //get api response text and remove asterick from it
   const apiResponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g,'$1');
   showTypingEffect(apiResponse,textElement,incomingMessageDiv);
    // textElement.innerText = apiResponse;
}catch(error){
    isResponseGenerating = false;
    textElement.innerText = error.messsage;
    textElement.classList.add("error");
    
}finally{
    incomingMessageDiv.classList.remove("loading");
}
}

//showing a loading animation while waiting for the ApI response
const showLoadingAnimation = () => {
    const html = `  <div class="message-content">
              <img src="gemini.svg" alt="Gemini Image" class="avatar">
              <p class="text"></p>
              <div class="loading-indicator">
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
              </div>
            </div> 
            <span onclick="copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>`;

     const incomingMessageDiv =     createMessageElement(html,"incoming","loading");
     chatList.appendChild(incomingMessageDiv);

     generateAPIResponse(incomingMessageDiv);
}
//copy message text to the clipboard
const copyMessage = (copyIcon)=>{
    const messageText = copyIcon.parentElement.querySelector(".text").innerText;
    navigator.clipboard.writeText(messageText);
    copyIcon.innerText = "done";//show tick icon
    setTimeout(()=>copyIcon.innerText = "content_copy",1000); //revert icon after 1 second
}
//3.
const handleOutgoingChat = ()=>{
    userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage;
    if(!userMessage ||isResponseGenerating) return; //when there is no message

    isResponseGenerating = true;

    // console.log(userMessage);
    const html = ` <div class="message-content">
            <img src="user.jpg" alt="User Image" class="avatar">
            <p class="text"></p>
          </div>`;

     const outgoingMessageDiv =     createMessageElement(html,"outgoing");
     outgoingMessageDiv.querySelector(".text").innerText = userMessage;
     chatList.appendChild(outgoingMessageDiv);

     typingForm.reset();//clear input field
     document.body.classList.add("hide-header");//hide header once chat start
     setTimeout(showLoadingAnimation,500);
     //show loading animation after a delay
    
}
//set user message and handle outgoing chat when a suggestion is clicked
suggestions.forEach(suggestion => {
    suggestion.addEventListener("click",()=>{
        userMessage = suggestion.querySelector(".text").innerText;
        handleOutgoingChat();
    }) ;
})
//toggle between light and dark themes
toggleThemeButton.addEventListener("click", ()=>{
  const isLightMode = document.body.classList.toggle("light_mode"); 
  localStorage.setItem("themeColor",isLightMode ? "light_mode" : "dark_mode"); 
   toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
});

deleteChatButton.addEventListener("click",()=>{
if(confirm("Are you want to delete all messages?")){
   localStorage.removeItem("savedChats") ;
   loadLocalstorageData();
}
});
//2.prevent form from submission and handle outgoing chat
typingForm.addEventListener("submit", (e)=>{
e.preventDefault();

handleOutgoingChat();
}); 