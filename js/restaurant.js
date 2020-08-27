class restaurant
{
    constructor(name, id, address, lat, lng) {
        this.name = name;
        this.id = id;
        this.address = address;
        this.lat = lat;
        this.long = lng;
        this.averageRating = {};
        this.ratings = [];
        this.totalStars = 5;
    }

    //fonction me permettant de calculer la moyenne des avis des restaurants
    calculateAverageRatingRestaurant()
    {  
        let totalRating = 0;
        let averageRating = 0;
        this.ratings.forEach((ratings)=>{
        totalRating += ratings.stars;
        });
        if (this.ratings.length == 0){
            averageRating = this.averageRating;
        } else {
            averageRating = totalRating/this.ratings.length;
        }
        let roundedAverageRating = Math.round(averageRating*10)/10;
        this.averageRating = roundedAverageRating;
        return this.averageRating;
    }

    // Fonction calculant le pourcentage des notes (Avis)
    calculatePercentageAverageRating()
    {
        let averRatingToShow = this.calculateAverageRatingRestaurant();
        let starPercentage = Math.round((averRatingToShow/this.totalStars)*100);
        return starPercentage;
    }

    // Je créée mes éléments HTML qui recevront les données relatives à chaque restaurant
    createRestaurantList()
    {
        let myArticle = document.createElement('article');
        myArticle.id = this.id.replace(/ /g,"");
        this.contentAndElementHTML(myArticle);
        $("#restaurants").append(myArticle);
        // grâce à cet évènement, je peux accéder aux informations d'un restaurant au click de l'utilisateur
        myArticle.addEventListener('click', ()=>{
            this.infoRestaurants();
        });
    }

    contentAndElementHTML(elt)
    {
        let myH5 = document.createElement('h5');
        let myPara2 = document.createElement('p');
        let myPara1 = document.createElement('p');
        let divStarsOuter = document.createElement('div');
        divStarsOuter.className = 'stars-outer';
        let divStarsInner = document.createElement('div');
        divStarsInner.className = 'stars-inner';
        divStarsInner.style.width = `${this.calculatePercentageAverageRating()}%`;
        myH5.textContent = this.name;
        myPara2.textContent = this.averageRating + '  ';
        myPara1.innerHTML = 'Adresse: ' + this.address + '<hr/>';
        myPara2.appendChild(divStarsOuter);
        divStarsOuter.appendChild(divStarsInner);
        elt.appendChild(myH5);
        elt.appendChild(myPara2);
        elt.appendChild(myPara1);
    }

    /*Fonction permettant l'affichage des avis et commentaires ainsi que la Streetview (avec API correspondante)
    pour chaque restaurant au click de l'utilisateur */
    infoRestaurants()
    {
        $("#myModalLabel, #myModalImg, #myModalBody").empty();
        $("#myModal").modal('show');
        $('#myModal').modal('handleUpdate');

        let pos = { lat: this.lat, lng: this.long };
        let location = pos.lat+","+ pos.lng;

        this.contentAndElementHTML(myModalLabel);

        if (this.ratings.length == 0) {
            // demande : envoyer les avis et commentaires de chaque restaurant de la google Places
            let request = 
            {
                placeId: this.id,
                fields: ['reviews']
            };  
            let newRatingsPlaces = [];
            let service = new google.maps.places.PlacesService(map); 
            service.getDetails(request, (place, status)=>
            {
                if (status === google.maps.places.PlacesServiceStatus.OK){
                    if (place.reviews){
                    // On boucle sur les avis
                    for (let review of place.reviews)
                    {
                        let view = {};
                        view.stars = review.rating;
                        view.comment = review.text;
                        newRatingsPlaces.push(view);
                    };
                    this.ratings = newRatingsPlaces; 
                    this.displayRating();
                    }
                }
            });
        }
            this.displayRating();

        // API Streetview
        let url = "https://maps.googleapis.com/maps/api/streetview?size=400x400&location="+location+"&key=AIzaSyCA5arXTDsp5lB6iANmio2i9EER5jo6msM";
        ajaxGet(url,()=>{ document.getElementById("myModalImg").src = url; })

        // gestionnaires d'événement au click pour l'ajout d'un commentaire et d'une note.
        $("#addRating").on('click', ()=>{
            this.addRatingAndComment();
        })
    }

    // afficher les avis et commentaires HTML
    displayRating() 
    {
        this.ratings.forEach((ratings)=>{
            let nbStars = ratings.stars;
            let percentageStars = Math.round((nbStars/this.totalStars)*100);
            let myList = document.createElement('ul');
            let listItem = document.createElement('li');
            let myPara2 = document.createElement('p');
            let myPara3 = document.createElement('p');
            let divStarsOuter2 = document.createElement('div');
            divStarsOuter2.className = 'stars-outer';
            let divStarsInner2 = document.createElement('div');
            divStarsInner2.className = 'stars-inner';
            divStarsInner2.style.width = `${percentageStars}%`;
            myPara2.textContent = nbStars + '  ';
            myPara3.innerHTML = ratings.comment + '<hr/>';
            myPara2.appendChild(divStarsOuter2);
            divStarsOuter2.appendChild(divStarsInner2);
            listItem.appendChild(myPara2);
            listItem.appendChild(myPara3);
            myList.appendChild(listItem);
            myModalBody.appendChild(myList);
        })
    }

    /* Fonction pour l'ajout des commentaires et Avis
    - création du formulaire et récupération des données envoyées par l'utilisateur */
    addRatingAndComment(){   
        $("#myModalLabelAddRating, #myModalBodyAddRating").empty();
        $("#myModalAddRating").modal('show');
        myModalLabelAddRating.textContent = this.name ;
        let form = document.createElement("form");
        form.className ="md-form border border-light p-2";
        let select = document.createElement("select");
        select.id = "rating";
        select.className = "browser-default custom-select";
        select.required = true;
        let optionDefault = document.createElement("option");
        optionDefault.value = "";
        optionDefault.textContent = "Notez le restaurant";
        select.appendChild(optionDefault);
        for (let i=0; i<6; i++){
            let option = document.createElement("option");
            option.value = i;
            option.textContent = i;
            select.appendChild(option);
        }
        let textArea = document.createElement("textarea");
        textArea.className = "md-textarea form-control";
        textArea.id = "comment";
        textArea.rows = 3;
        textArea.cols = 30;
        textArea.placeholder = "Votre commentaire ...";
        let input = document.createElement("input");
        input.type = "submit";
        input.value = "Valider";
        input.className = "btn btn-secondary";
        form.appendChild(select);
        form.appendChild(textArea);
        form.appendChild(input);
        form.addEventListener("submit", (e)=> {
            let rating = Number(form.elements.rating.value);
            let comment = form.elements.comment.value;
            let rate = {
                "stars": rating,
                "comment": comment,
            };
            this.ratings.unshift(rate);
            e.preventDefault();
            this.infoRestaurants();
            restaurantManager.displayRestaurants();
            $("#myModalAddRating").modal('hide');
        });
        myModalBodyAddRating.appendChild(form);
    }
}