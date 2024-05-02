import React, { useState, useEffect } from 'react';
import './NutritionResults.css';
import moment from 'moment';

const NutritionResults = ({ nutritionData, onEditComplete }) => {
  const [details, setDetails] = useState({
    mealName: '',
    imageURL: '',
    date: '',
    totalCalories: 0,
    totalCarbs: 0,
    totalFat: 0,
    totalProteins: 0,
    ingredients: [],
  });
  const [isEditing, setIsEditing] = useState(true); // Start in editing mode

  useEffect(() => {
    if (nutritionData) {
      setDetails({
        mealName: nutritionData.dish || 'N/A',
        imageURL: nutritionData.imageURL || 'default_image_url_here',
        date: moment().format('MMMM Do YYYY, h:mm:ss a'),
        totalCalories: nutritionData.macros.calories || 0,
        totalCarbs: nutritionData.macros.carbohydrates || 0,
        totalFat: nutritionData.macros.fat || 0,
        totalProteins: nutritionData.macros.protein || 0,
        ingredients: nutritionData.ingredients.map(ing => ({
          name: ing.name || 'N/A',
          calories: ing.calories || 0,
          carbs: ing.carbohydrates || 0,
          fat: ing.fat || 0,
          protein: ing.protein || 0,
          weight: ing.quantity ? `${ing.quantity}${ing.unit || 'g'}` : 'N/A'
        })),
      });
    }
  }, [nutritionData]);

  const handleNutritionChange = (e) => {
    const value = parseFloat(e.target.value);
    setDetails(prevDetails => ({
        ...prevDetails,
        [e.target.name]: isNaN(value) ? 0 : value  // Set to 0 if NaN
    }));
};


const handleSave = () => {
  const updatedNutritionData = {
      mealName: details.mealName,
      imageURL: details.imageURL,
      totalCalories: details.totalCalories,
      totalCarbs: details.totalCarbs,
      totalFat: details.totalFat,
      totalProteins: details.totalProteins,
      ingredients: details.ingredients,
      lastUpdated: moment().format('MMMM Do YYYY, h:mm:ss a')
  };

  console.log('Updating nutrition data:', updatedNutritionData); // Debugging line to check the data
  onEditComplete(updatedNutritionData);
  setIsEditing(false);
};

return (
  <div className="nutrition-results">
    <div className="meal-header">
      <h2>{details.mealName}</h2>
      <p>Last updated: {details.date}</p>
      {isEditing ? (
        <button onClick={handleSave}>Save</button>
      ) : (
        <button onClick={() => setIsEditing(true)}>Edit</button>
      )}
    </div>
    <div className="meal-image">
      {details.imageURL && <img src={details.imageURL} alt={details.mealName} />}
    </div>
    <div className="nutrition-breakdown">
      {isEditing ? (
        <>
          <div className="nutrition-item">
            <label htmlFor="totalCalories">Calories</label>
            <input type="number" id="totalCalories" name="totalCalories" value={details.totalCalories} onChange={handleNutritionChange} />
          </div>
          <div className="nutrition-item">
            <label htmlFor="totalCarbs">Carbs</label>
            <input type="number" id="totalCarbs" name="totalCarbs" value={details.totalCarbs} onChange={handleNutritionChange} />
          </div>
          <div className="nutrition-item">
            <label htmlFor="totalProteins">Proteins</label>
            <input type="number" id="totalProteins" name="totalProteins" value={details.totalProteins} onChange={handleNutritionChange} />
          </div>
          <div className="nutrition-item">
            <label htmlFor="totalFat">Fats</label>
            <input type="number" id="totalFat" name="totalFat" value={details.totalFat} onChange={handleNutritionChange} />
          </div>
        </>
      ) : (
        <>
          <div className="nutrition-item">Calories: {details.totalCalories} kcal</div>
          <div className="nutrition-item">Carbs: {details.totalCarbs} g</div>
          <div className="nutrition-item">Proteins: {details.totalProteins} g</div>
          <div className="nutrition-item">Fats: {details.totalFat} g</div>
        </>
      )}
    </div>
  </div>
);
};

export default NutritionResults;