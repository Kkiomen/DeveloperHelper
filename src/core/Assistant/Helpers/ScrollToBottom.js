const scrollToBottom = function(elementId){
    setTimeout(() => {
        document.getElementById(elementId).scrollTo({
            top: document.getElementById(elementId).scrollHeight,
            behavior: 'smooth',
        });
    }, 100);
};

export default scrollToBottom;