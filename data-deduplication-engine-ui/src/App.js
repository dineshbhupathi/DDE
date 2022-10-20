import './App.css';
import { BrowserRouter , Route, Routes } from 'react-router-dom'
import UploadData from './components/uploadData/upload_data'
import './components/css/bootstrap-nav-wizard.css';
// import './components/css/bootstrap.simplex.min.css';
import './components/css/dataTables.bootstrap.css';
import './components/css/select2.min.css';
import './components/css/bootstrap5.min.css'
import './components/css/custom.css';
import DatasetsProcess from './components/dataprocessing/datasets-process'
import DefineColumns from './components/dataprocessing/definecolumns'
import TrainModel from './components/dataprocessing/train-model';
import LandingPage from './components/pages/landingpage'
import DataAnalysis from './components/pages/dataAnalytics';
import UploadDataAnalysis from './components/pages/upload_data_analysis'
import RulesEngine from './components/pages/rulesEngine'
import MatchingEngine from './components/pages/matchingEngine'
import MissingValues from './components/pages/predictMissingValues'
import DetectAnomalies from './components/pages/detectAnomalies'
import MatchingEngineDefineColumns from './components/pages/matchingEngineDefineColumns';
import ProjectDetailsPage from './components/pages/projectDetails';

function App() {
  return (
    <div className="App">
     <BrowserRouter>
     <div>
      <Routes>
        {/* <Route exact path='/'element={<LandingPage/>} /> */}
        <Route exact path='/identify-duplicates'element={<DatasetsProcess/>} />
        <Route exact path='/project-details-page/:id'element={<ProjectDetailsPage/>} />

        <Route exact path='/upload-data'element={<UploadData/>} />
        <Route exact path='/define-fields/:id'element={<DefineColumns/>} />
        <Route exact path='/train-model'element={<TrainModel/>} />
        <Route exact path='/data-analysis'element={<DataAnalysis/>} />
        <Route exact path='/upload-data-analysis'element={<UploadDataAnalysis/>} />
        <Route exact path='/dynamic-rule-engine' element={<RulesEngine/>}/>
        <Route exact path='/data-matching-engine' element={<MatchingEngine/>}/>
        <Route exact path='/detect-anomalies' element={<DetectAnomalies/>}/>
        <Route exact path='/predict-missing-values' element={<MissingValues/>}/>
        <Route exact path='/data-matching-engine-define-columns' element={<MatchingEngineDefineColumns/>}/>
      </Routes>
     </div>
     </BrowserRouter>
    </div>
  );
}

export default App;
