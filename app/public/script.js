
    function displayUrl() {
        var radio = document.getElementById("checkBox");
        radio.onclick = function(event) {
            if (document.getElementById("url") === null) {
                var x = document.createElement("input");
                x.setAttribute("type", "text");
                x.setAttribute("placeholder","Enter Photo URL");
                x.setAttribute("name", "url")
                x.id = "url";
                var section = document.getElementById("aboutMe")
                var addUrl = section.getElementsByTagName("p");
                addUrl[0].insertBefore(x, document.getElementById("checkBox").nextSibling);
            }
        }
    };
     
    function displayQuestions() {
        //question obj
        var quesObj = {
            quesArr : [ "Your mind is always buzzing with unexplored ideas and plans.",
            "Generally speaking, you rely more on your experience than your imagination.",
            "You find it easy to stay relaxed and focused even when there is some pressure.",
            "You rarely do something just out of sheer curiosity.",
            "People can rarely upset you.",
            "It is often difficult for you to relate to other people’s feelings.",
            "In a discussion, truth should be more important than people’s sensitivities.",
            "You rarely get carried away by fantasies and ideas.",
            "You think that everyone’s views should be respected regardless of whether they are supported by facts or not.",
            "You feel more energetic after spending time with a group of people."
            ],
            addHtml : function () {
                for (var i=0; i < quesObj.quesArr.length; i++) {
                    var div = document.createElement("div");
                    var html = 
                    '<h3><strong>' + "Question " + parseInt(i + 1,10) + '</strong></h3>' +
                    '<h4>' + quesObj.quesArr[i] + '</h4>' + 
                    '<div class="w3-row">' + 
                        '<div class="w3-third">' + 
                            '<input type="button" class="w3-button" >'+ 
                                '<select data-placeholder="" class="w3-select w3-border" id="questions" name="questions" required>' + 
                                    '<option value="" disabled selected>Choose your option</option>' + 
                                    '<option value="1">1 (Strongly Disagree)</option>' +
                                    '<option value="2">2</option>' + 
                                    '<option value="3">3</option>' +
                                    '<option value="4">4</option>' + 
                                    '<option value="5">5 (Strongly Agree)</option>' +
                                '</select>' +
                            '</input>' + 
                        '</div>' +
                    '</div>';
                    div.className = "w3-card-4 w3-padding-large"
                    div.innerHTML = html;
                    
                var aboutMe = document.getElementById('aboutMe');
                aboutMe.appendChild(div);
                }
                quesObj.addSubmit();
            },
            addSubmit: function () {
                var div = document.createElement("div");
                var html = '<div>' + 
                    '<input type="submit" class="w3-green w3-section w3-block w3-round w3-xlarge" id="submit" value="submit">' + 
                '</div>';
                div.innerHTML = html
                var aboutMe = document.getElementById('aboutMe');
                aboutMe.appendChild(div);

            }
        }
        quesObj.addHtml();
    };

    function postData() {
        //validation boolean
        var bool = false;
        var submitForm = document.getElementById("submit");
        submitForm.onclick = function(event) { 
            //current name       
            var name = document.getElementById("name").value
            //current score
            var score = [];
            
            for (var i = 0; i < document.getElementById("surveyForm").elements.questions.length; i++) {
                score.push(document.getElementById("surveyForm").elements.questions[i].value)
            } 
            
            if (document.getElementById("name").checkValidity() == false || score.includes("")) {
                bool = true;
                getResults(name,score,bool);
            } else {
                getResults(name,score,bool);
            }
        }
    };

    function getResults(name,score,bool) {

        var currentURL = window.location.origin
        
        $.ajax({url: currentURL + "/api/",method:"GET"}).done(function(data) {
            
            // compare the difference between current user's scores against those from other users, question by question. Add up the differences to calculate the `totalDifference`.
            // * The closest match will be the user with the least amount of difference.
            var totDiffArr = [];
            for (item in data) {
                
                var check = data[item].name 
                if (check !== name) {
                    var temp = [];                        
                    for (var i = 0; i < data[item].scores.length; i++) {
                        temp.push(Math.abs(data[item].scores[i] - score[i]))
                    }
                    if (temp.length = 10) {
                        //get the sum of the scores and push them to the total difference array
                        totalDifference = temp.reduce(function(sum,value) {
                            return sum + value;
                        },0)
                        //create an object for the temp with name and total difference
                        var obj = {
                            tempName: data[item].name,
                            tempTotDiff: totalDifference
                        }
                        //push the object to a tempObj arr
                        totDiffArr.push(obj)  
                    }
                }
            }
            //sort the array of objects according to total diff in ascending order
            totDiffArr.sort(function(a,b) {
                return a.tempTotDiff - b.tempTotDiff;
            })
            //if the score for index 0 equals the score for any other friends, return the names of both in a new array
            var allMatches = []
            for (choice in totDiffArr) {
                if (totDiffArr[choice].tempName !== totDiffArr[0].tempName) {
                    if (totDiffArr[choice].tempTotDiff === totDiffArr[0].tempTotDiff) {
                        allMatches.push(totDiffArr[choice].tempName)
                    }
                }
            }
            //pass the name to an ajax call and display data in a modal for best match
            getMatch(totDiffArr[0].tempName,allMatches,bool);
        })
    };

    function getMatch (name,arr,bool) {

        var routeName = name.toLowerCase();
        var currentURL = window.location.origin
    
        $.ajax({url: currentURL + "/api/" + routeName ,method:"GET"}).done(function(data) { 
            
            var match = JSON.stringify(data)
            displayModal(match,bool)
        })
    };
    
    function displayModal(match,bool) {

        // console.log(`final bool: ${bool}`);

        if (bool === false) {
            
            var temp = JSON.parse(match);
            console.log(`Address:${address} Match:${temp.name}`);
            var currentURL = window.location.origin
            var address;
            //if no photo property, send url in the modal
            if (temp.photo === "") {
                address = temp.url
            } else if (temp.photo !== "") {
                address = "/survey2/" + temp.photo.toString();
            }
            document.getElementById("id01").style.display='block';
            var modal = document.getElementById("modalData");
            modal.innerHTML =  
                "<img src=" + address + " alt='' style='width:100%'>" + 
                    "<div class='w3-container w3-center w3-text-black'>" + 
                        "<h3> Your best match is: </h3>" + 
                        "<h4 class=''>" + temp.name + "</h4>" + 
                    "</div>";
                document.getElementById("surveyForm").reset();  
        } else {
        document.getElementById("id01").style.display='block';
        var modal = document.getElementById("modalData");
        modal.innerHTML =  
            "<img src='https://res.cloudinary.com/ideapod/image/upload/c_fill,h_314,w_512/604089aa-333a-42aa-bb49-9ce67433ac26.jpg' alt='' style='width:100%'>" + 
                "<div class='w3-container w3-center w3-text-black'>" + 
                    "<h3> Uh Oh! </h3>" + 
                    "<h4 class=''> Fill out the entire survey to see your best match!</h4>" + 
                "</div>";
            document.getElementById("surveyForm").reset();
        }
    };

    // Get the modal
    var modal = document.getElementById('id01');
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    function clearTable() {
        var currentURL = window.location.origin;
        $.ajax({ url: currentURL + "/api/clear", method: "POST" });
    }

    function clearData() {
        var clear = document.getElementById("clear")
        clear.onclick = function() {
            clearTable();
            // Refresh the page after data is cleared
            location.reload();
        };
    }
    clearData();
    displayQuestions();
    displayUrl();
    postData();
    
    