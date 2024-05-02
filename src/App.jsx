import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material'; 
import Nav from './components/Nav/Nav';
import Welcome from './views/Welcome';
import Header from './components/Home/Header';
import MacroBreakdown from './components/Home/MacroBreakdown';
import DateDisplay from './components/Home/DateDisplay';
import NutritionResults from './views/NutritionResults';
import './App.css';

const initialState = {
  dish: '',
  imageURL: '',
  macros: {
    calories: 0,
    carbohydrates: 0,
    protein: 0,
    fat: 0
  },
  originalMacros: {
    calories: 0,
    carbohydrates: 0,
    protein: 0,
    fat: 0
  },
  ingredients: [],
  editVersion: 0
};

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [nutritionData, setNutritionData] = useState(initialState);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' }); // Added state for snackbar

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleNutritionData = (data) => {
    console.log("Received nutrition data:", data); // Add this log
    if (data && data.success && data.finalNutritionData) {
      setNutritionData({
        dish: data.finalNutritionData.dish,
        imageURL: data.finalNutritionData.imageURL,
        macros: {
          calories: data.finalNutritionData.macros.calories,
          carbohydrates: data.finalNutritionData.macros.carbohydrates,
          protein: data.finalNutritionData.macros.protein,
          fat: data.finalNutritionData.macros.fat
        },
        ingredients: data.finalNutritionData.ingredients,
        editVersion: nutritionData.editVersion + 1 
      });
      setShowEditModal(true);
      console.log("Nutrition data set in state:", nutritionData); // Log after state update
    } else {
      // Log an error or handle the case where data is missing
      console.log("Data missing or invalid:", data);
      setSnackbar({
        open: true,
        message: "No food detected or data is missing.",
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleEditComplete = (updatedData) => {
    setNutritionData(prevData => {
      const newMacros = {
        calories: parseFloat(updatedData.totalCalories) || 0,
        carbohydrates: parseFloat(updatedData.totalCarbs) || 0,
        protein: parseFloat(updatedData.totalProteins) || 0,
        fat: parseFloat(updatedData.totalFat) || 0
      };
  
      // Directly update without calculating differences
      return {
        ...prevData,
        dish: updatedData.mealName,
        imageURL: updatedData.imageURL,
        macros: newMacros, // Update directly with new values
        originalMacros: newMacros, // Keep sync between original and current
        ingredients: updatedData.ingredients,
        editVersion: prevData.editVersion + 1
      };
    });
    setShowEditModal(false);
  };

  const handleSubmit = (formData) => {
    fetch('/analyze-image', { method: 'POST', body: formData })
      .then(response => response.json())
      .then(data => {
          if (!data.success) {
              setSnackbar({ open: true, message: data.error, severity: 'error' });
          } else {
              handleNutritionData(data);
          }
      })
      .catch(error => {
          setSnackbar({ open: true, message: 'Failed to connect to the server.', severity: 'error' });
      });
  };
  

  return (
    <BrowserRouter>
      <div className="app">
        {showWelcome ? (
          <Welcome />
        ) : (
          <>
            <Header />
            <DateDisplay />
            <main className="main-content">
              <MacroBreakdown nutrition={nutritionData.macros} />
              {showEditModal && (
                <NutritionResults
                  nutritionData={nutritionData}
                  onEditComplete={handleEditComplete}
                />
              )}
              <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
              >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                  {snackbar.message}
                </Alert>
              </Snackbar>
            </main>
            <Nav onNutritionDataReceived={handleNutritionData} />
          </>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
