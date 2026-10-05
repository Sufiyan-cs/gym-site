'use client';

import { useState } from 'react';

export default function CalorieCalculator() {
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState('male');
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);
  const [activity, setActivity] = useState(1.55); // Moderate
  const [goal, setGoal] = useState('maintain');

  const calculateCalories = () => {
    // Mifflin-St Jeor
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    bmr += gender === 'male' ? 5 : -161;
    
    let tdee = bmr * activity;
    
    switch(goal) {
      case 'bulk': tdee += 500; break;
      case 'cut': tdee -= 500; break;
      case 'aggressive-cut': tdee -= 750; break;
    }
    
    return Math.round(tdee);
  };

  const calories = calculateCalories();
  const protein = Math.round(weight * 2.2); // ~2.2g per kg
  const fat = Math.round((calories * 0.25) / 9); // 25% of calories
  const carbs = Math.round((calories - (protein * 4) - (fat * 9)) / 4);

  return (
    <>
      <style>{`
        .calc-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 20px;
        }
        .calc-title {
          font-family: 'Anton', sans-serif;
          font-size: 20px;
          color: var(--text-primary);
          margin-bottom: 20px;
        }
        
        .calc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        
        .calc-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .calc-label {
          font-size: 12px;
          color: var(--text-secondary);
          text-transform: uppercase;
          font-weight: 500;
        }
        .calc-input {
          background: var(--surface-2);
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 12px;
          color: var(--text-primary);
          font-size: 15px;
          outline: none;
        }
        .calc-input:focus { border-color: var(--accent); }
        
        .calc-result {
          margin-top: 24px;
          background: var(--surface-2);
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }
        .calc-res-label {
          font-size: 11px;
          color: var(--text-secondary);
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.1em;
          margin-bottom: 4px;
        }
        .calc-res-cal {
          font-family: 'Anton', sans-serif;
          font-size: 42px;
          color: var(--accent);
          line-height: 1;
          margin-bottom: 16px;
        }
        .calc-res-cal span {
          font-size: 16px;
          color: var(--text-tertiary);
          font-family: 'IBM Plex Mono', monospace;
        }
        
        .macro-row {
          display: flex;
          justify-content: space-between;
          border-top: 1px solid var(--line);
          padding-top: 16px;
        }
        .macro-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }
        .macro-label {
          font-size: 11px;
          color: var(--text-secondary);
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .macro-val {
          font-family: 'Anton', sans-serif;
          font-size: 20px;
          color: var(--text-primary);
        }
      `}</style>

      <div className="calc-card">
        <h3 className="calc-title">MACRO CALCULATOR</h3>
        
        <div className="calc-grid">
          <div className="calc-field">
            <label className="calc-label">Gender</label>
            <select value={gender} onChange={e => setGender(e.target.value)} className="calc-input">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="calc-field">
            <label className="calc-label">Age</label>
            <input type="number" value={age} onChange={e => setAge(Number(e.target.value))} className="calc-input" />
          </div>
          <div className="calc-field">
            <label className="calc-label">Weight (kg)</label>
            <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} className="calc-input" />
          </div>
          <div className="calc-field">
            <label className="calc-label">Height (cm)</label>
            <input type="number" value={height} onChange={e => setHeight(Number(e.target.value))} className="calc-input" />
          </div>
        </div>
        
        <div className="calc-field" style={{marginBottom: 16}}>
          <label className="calc-label">Activity Level</label>
          <select value={activity} onChange={e => setActivity(Number(e.target.value))} className="calc-input">
            <option value={1.2}>Sedentary</option>
            <option value={1.375}>Light Exercise</option>
            <option value={1.55}>Moderate Exercise</option>
            <option value={1.725}>Heavy Exercise</option>
            <option value={1.9}>Athlete</option>
          </select>
        </div>

        <div className="calc-field">
          <label className="calc-label">Goal</label>
          <select value={goal} onChange={e => setGoal(e.target.value)} className="calc-input">
            <option value="maintain">Maintain Weight</option>
            <option value="bulk">Bulk (+500 cal)</option>
            <option value="cut">Cut (-500 cal)</option>
            <option value="aggressive-cut">Aggressive Cut (-750 cal)</option>
          </select>
        </div>

        <div className="calc-result">
          <div className="calc-res-label">Target Calories</div>
          <div className="calc-res-cal">{calories} <span>kcal</span></div>
          
          <div className="macro-row">
            <div className="macro-item">
              <span className="macro-label">Protein</span>
              <span className="macro-val">{protein}g</span>
            </div>
            <div className="macro-item" style={{borderLeft: '1px solid var(--line)', borderRight: '1px solid var(--line)'}}>
              <span className="macro-label">Carbs</span>
              <span className="macro-val">{carbs}g</span>
            </div>
            <div className="macro-item">
              <span className="macro-label">Fat</span>
              <span className="macro-val">{fat}g</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
