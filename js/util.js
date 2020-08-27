let minRating = 0;
let maxRating = 5;
let addRestau = false;

//fonction qui gère mon filtre par moyenne (Avis) - Init jQuery UI slider range
$(function(){
    $("#slider-range").slider({
      range: true,
      min: 0,
      max: 5,
      step: 0.5,
      values: [0, 5],
      slide: function(event, ui) {
        $("#ratingRange").val(ui.values[0] + " - " + ui.values[1]);
        minRating = ui.values[0];      
        maxRating = ui.values[1];
        restaurantManager.displayRestaurants();
      }
    });
    $("#ratingRange").val($("#slider-range").slider("values", 0)+" - " +$("#slider-range").slider("values", 1));
});

// Evènement au click sur le bouton d'ajout de restaurant
btn_ajout_restau.addEventListener("click", ()=> 
{ 
  // Reset du formulaire
  form_Addrestau.reset();
  // On déroule le formulaire
  $(form_Addrestau).slideToggle();
  // Focus sur le champ de nom
  document.querySelector("#form_Addrestau input").focus();
  // On passe en mode d'ajout de restaurant
  addRestau = true;
});