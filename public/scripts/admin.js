function resetSheet(){

    fetch('./resetSheet', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {console.log(response) }) // Parse JSON response
        .catch((error) => {
            console.error('Error:', error);
        });
}