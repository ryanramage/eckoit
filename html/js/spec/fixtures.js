beforeEach(function() {
  
  this.fixtures = {
    
    Things: {
      valid: { // response starts here
        "status": "OK",
        "version": "1.0",
        "response": {
          "things": [
            {
              "id": 1,
              "name": "Destroy Alderaan"
            },
            {
              "id": 2,
              "name": "Close exhaust port"
            }
          ]
        }
      } 
    }
    
  };
  
});
