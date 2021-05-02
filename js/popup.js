let addItemForm =document.querySelector('#addItemForm');
let itemList = document.querySelector('.actionItems');
let backgroundButton = document.querySelector('.backgroundButton');
let storage = chrome.storage.sync;
let actionItemsUtile = new ActionItems();

storage.get(['actionItems', 'name', 'theme' ], (data)=>{
  let actionItems = data.actionItems; 
  let name = data.name;
  let theme = data.theme;
  setGreeting();
  if(!name){
    $('#updateNameModal').modal('show');
    createUpdateNameDialogListener();
    createUpdateNameListener();
    setUserName(name);
    handleTheme();
  } else {
    setUserName(name);   
  }
  createQuickActionListener();   
  renderActionItems(actionItems);
  createUpdateNameDialogListener();
  createUpdateNameListener();
  actionItemsUtile.setProgress();
  if(theme){
    setBackground(theme);
  } else {
    handleTheme();
  }
  
  chrome.storage.onChanged.addListener(()=>{
    actionItemsUtile.setProgress();   
  })
});

const setBackground = (theme) => {
  document.querySelector('.backgroundButton').setAttribute('name', `${theme}`);
  let newTheme = theme ? theme : theme="white";
  if(theme == "dark"){
    document.querySelector('body').style.backgroundColor = "#595959";
    document.querySelector('.progress').style.backgroundColor ="#595959";
    document.querySelector('#container svg').style.backgroundColor = "#595959";
    document.querySelector('.actionInput').style.backgroundColor = "#595959";
    document.querySelector('.actionInput__text').style.color = '#6c757d';
    backgroundButton.innerText = "White Theme";
  } else {
    backgroundButton.innerText = "Dark Theme";
    document.querySelector('body').style.backgroundColor = "#F6F6F6";
    document.querySelector('.progress').style.backgroundColor ="#F6F6F6";
    document.querySelector('#container svg').style.backgroundColor = "#F6F6F6";
    document.querySelector('.actionInput').style.backgroundColor = "#F6F6F6";
    document.querySelector('.actionInput__text').style.color = '#212529';
  }
}

const setUserName = (name) => {
  let newName = name ? name : "Add name";
  if(name){
    document.querySelector('.name__value').innerText = name;
  } else{
    console.log("Write your name");
  }
  
}

const renderActionItems = (actionItems) => {
  let filteredItems = filterActionItems(actionItems);
  filteredItems.forEach((item) => {
    renderAction(item.text, item.id, item.completed, item.website, 250);
  });  
  storage.set({
    actionItems: filteredItems
  })
}

const filterActionItems = (actionItems) => {
  var currentDate = new Date();
  let filteredItems;
  currentDate.setHours(0,0,0,0);
      filteredItems = actionItems.filter((item)=> {
        if(item.completed){
          const completedDate = new Date(item.completed);
          if(completedDate < currentDate){
            return false;
          }
        }
        return true;
      })  
  return filteredItems;
}

const createUpdateNameDialogListener = (e) =>{
  let greetingName = document.querySelector('.greeting__name');
  greetingName.addEventListener('click', ()=>{
    storage.get(['name'], (data) =>{   
      let name = data.name ? data.name : '';
      // name ? document.getElementById('inputName').value = name : "";  
    });  
    $('#updateNameModal').modal('show');
  })
} 

addItemForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let itemText = addItemForm.elements.namedItem('itemText').value;
  if(itemText){
    actionItemsUtile.add(itemText, null, (actionItem)=>{
      renderAction(actionItem.text, actionItem.id, actionItem.completed, actionItem.website, 250);
    });
    addItemForm.elements.namedItem('itemText').value = '';
  }else{
    console.log('No value!');
  }
  });

  const createQuickActionListener = () => {
    let quickElement=[];
    quickElement = document.querySelectorAll('.quick-action');
    quickElement.forEach((element) =>{
      element.addEventListener('click', handleQuickActionListener);
    })
    
  }

  const handleTheme = () =>{
    let theme = document.querySelector('.backgroundButton').getAttribute('name');
    if(theme){
      actionItemsUtile.saveTheme(theme, ()=>{
        setBackground(theme);
      })
    } else {
      theme = "white";
      setBackground(theme);
    }
  }

  const handleUpdateName = (e) => {
    let name = document.getElementById('nameInput').value;
    if(name !== null && name){
      actionItemsUtile.saveName(name, ()=>{
        //set the user`s name on front end
        setUserName(name);
        $('#updateNameModal').modal('hide');
      })
    }
  }

  const createUpdateNameListener = () =>{
    let element = document.querySelector('#update-name');
    element.addEventListener('click', handleUpdateName);
  }

  const handleQuickActionListener = (e) => {
    const quickElementAction = e.target;
    let textQuick = quickElementAction.getAttribute('data-text');
    if(textQuick){
      const id = e.target.getAttribute('data-id');
      getCurrentTab().then((tab)=>{
          actionItemsUtile.addQuickActionItem(id, textQuick, tab, (actionItem)=>{
            renderAction(actionItem.text, actionItem.id, actionItem.completed, actionItem.website);
          });
      
      })
    }
  }

  async function getCurrentTab() {
    return await new Promise ((resolve, reject)=>{
      chrome.tabs.query({'active': true, 'currentWindow': true}, (tabs)=>{ 
        resolve(tabs[0]);
      });
    }) 
  }

  const handleCompletedEventListener = (e) => {
    const parent = e.target.parentElement.parentElement.parentElement.parentElement;
    const id = parent.getAttribute('data-id');
    if(parent.classList.contains('completed')){
      parent.classList.remove('completed');
      actionItemsUtile.markUnmarkCompleted(id, null);
    } else {
      parent.classList.add('completed');
      actionItemsUtile.markUnmarkCompleted(id, new Date().toString());
    }    
  }

  const handleDeleteEventListener = (e) => {
    const parent = e.target.parentElement.parentElement.parentElement;
    const id = parent.getAttribute('data-id');
    let jElement = $(`div[data-id="${id}"]`);
    actionItemsUtile.remove(id, ()=>{
      animateUp(jElement, 250);
    });
  }

const createLinkContainer = (url, favIcon, title) =>{
  let element = document.createElement('div');
  element.classList.add('actionItem__linkContainer');
  element.innerHTML = `
    <a href="${url}" target="_blank">
      <div class="actionItem__link">
          <div class="actionItem__favIcon">
              <img src="${favIcon}" alt="">
          </div>
          <div class="actionItem__title">
              <span>${title}</span>
          </div>
      </div>
    </a>
  `
  return element;
}

const renderAction = (text, id, completed,website=null, animationDuration=300) => {
  let element = document.createElement('div');
  element.classList.add('actionItem__item');
  let mainElement = document.createElement('div');
  mainElement.classList.add('actionItem__main');
  let checkEl = document.createElement('div');
  checkEl.classList.add('actionItem__check');
  let textEl = document.createElement('div');
  textEl.classList.add('actionItem__text');
  let deleteEl = document.createElement('div');
  deleteEl.classList.add('actionItem__delete');

  checkEl.innerHTML = `
      <div class="actionItem__checkBox">
        <i class="fas fa-check" aria-hidden="true"></i>
      </div>
  `;
  if(completed){
    element.classList.add('completed');
  }
  element.setAttribute('data-id', id);
  checkEl.addEventListener('click', handleCompletedEventListener);
  deleteEl.addEventListener('click', handleDeleteEventListener);
  textEl.textContent = text;
  deleteEl.innerHTML = `<i class="fas fa-times" aria-hidden="true"></i>`;
  mainElement.appendChild(checkEl);
  mainElement.appendChild(textEl);
  mainElement.appendChild(deleteEl);
  element.appendChild(mainElement);
  if(website){
    let linkContainer = createLinkContainer(website.url, website.favIcon, website.title);
    element.appendChild(linkContainer);
  }
  itemList.prepend(element);
  
  let jElement = $(`div[data-id="${id}"]`); 
  animateDown(jElement, animationDuration);
}

const animateUp = (element, animeDuration) => {
  let height = element.innerHeight();
  element.animate({
    opacity: '0',
    marginTop: -height,
    "z-index": "-1"
  }, animeDuration, 'linear', ()=>{
    setTimeout(()=>{
      element.remove();
    }, 900)
  });
}
  
 
const animateDown = (elementA, duration) =>{
  
  elementA.animate({
    opacity: '1',
    marginTop: '12px',
    'z-index': "1"
  }
  , duration);
}

const setGreeting = () => {
  let image = document.querySelector('#greeting__image');
  let greeting = "Good ";
  const date = new Date();
  const hour = date.getHours();
  if (hour >=5 && hour < 11){
    image.src = 'images/good-morning.png';
    greeting += "Morning,";
  } else if(hour >=11 && hour < 16){
    image.src = 'images/good-afternoon.png';
    greeting += "Afternoon,";
  } else if(hour >=16 && hour < 20){
    image.src = 'images/good-evening.png';
    greeting += "Evening,";
  } else {
    image.src = 'images/good-night.png';
    greeting += "Night,";
  }
  document.querySelector('.greeting__type').innerText = greeting;
}

backgroundButton.addEventListener('click', (e)=>{ 
  // handleTheme();
  let nameButton = e.target.getAttribute('name');
  // setBackground(nameButton);
  if(nameButton == "white"){
    document.querySelector('body').style.backgroundColor = "#595959";
    e.target.setAttribute('name',"dark");
    document.querySelector('.progress').style.backgroundColor ="#595959";
    document.querySelector('#container svg').style.backgroundColor = "#595959";
    e.target.innerText = "White Theme";
    
    setBackground('dark');
    handleTheme();
    document.querySelector('.actionInput').style.backgroundColor = "#595959";
    document.querySelector('.actionInput__text').style.color = '#6c757d';
  } else {
    document.querySelector('body').style.backgroundColor = "#F6F6F6";
    e.target.setAttribute('name',"white");
    document.querySelector('.progress').style.backgroundColor ="#F6F6F6";
    document.querySelector('#container svg').style.backgroundColor = "#F6F6F6";
    e.target.innerText = "Dark Theme";
   
    setBackground('white'); 
    handleTheme();
    document.querySelector('.actionInput').style.backgroundColor = "#F6F6F6";
    document.querySelector('.actionInput__text').style.color = '#212529';
  }
})

