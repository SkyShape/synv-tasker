

class ActionItems {

    addQuickActionItem = (id, text,tab, callBack) => {
        let website = null;
        if(id == 'quick-action-2'){
            website = {
                url: tab.url,
                favIcon: tab.favIconUrl,
                title: tab.title
            }
        }        
        this.add(text, website, callBack);
    }

    add = (text, website = null, callback) => {
        let actionItem = {
            id: uuidv4(),
            added: new Date().toString(),
            text: text,
            completed: null,
            website: website,
        }     
            chrome.storage.sync.get(['actionItems'], (data)=>{
            let items = data.actionItems;
            if(!items){
                items = [actionItem]
            } else {
                items.push(actionItem);
            }  
            chrome.storage.sync.set({
                actionItems: items
            }, ()=>{
                callback(actionItem);
            })      
            })
    };

    setProgress = () => {
        chrome.storage.sync.get(['actionItems'], (data)=> {
            let progress = 0; 
            let actionItems = data.actionItems;
            if(actionItems){
                    let completedItems;
                    let totalItems = actionItems.length;
                    completedItems = actionItems.filter(item => item.completed).length;      
                    if(totalItems > 0){                      
                        progress = completedItems/totalItems;
                    }
                    this.setBrowserBadge(totalItems - completedItems); 
                }           
            if(typeof bar !== "undefined") bar.animate(progress);
            })
            
        }

    setBrowserBadge = (todoItems) => {
        let text = `${todoItems}`;
        if(todoItems > 9){
            text = '9+'
        }
        chrome.browserAction.setBadgeText({text: text});
    }

    markUnmarkCompleted = (id, completeStatus) => {
        chrome.storage.sync.get(['actionItems'], (data)=>{    
          let items = data.actionItems;
          let foundItemIndex = items.findIndex((item) => item.id == id);
          if(foundItemIndex >= 0){
            items[foundItemIndex].completed = completeStatus;
            chrome.storage.sync.set({
              actionItems: items
            })
          }
        })
    } 

    saveName = (name, callback) => {
        chrome.storage.sync.set({
            name: name
        }, callback)
    }

    saveTheme = (theme, callback) => {
        chrome.storage.sync.set({
            theme: theme
        }, callback)
    }

    remove = (id, callBack) => {
        chrome.storage.sync.get(['actionItems'], (data) => {
            let items = data.actionItems;
            let index = items.findIndex((item) => item.id == id);
            if (index > -1){
                items.splice(index, 1);
                chrome.storage.sync.set({
                    actionItems: items
                }, callBack)
            } 
        })
    }     
}