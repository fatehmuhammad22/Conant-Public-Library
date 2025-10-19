import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LibraryCMS from './pages/LibraryCMS';
import TopRibbonEditor from './pages/TopRibbonEditor';
import FooterEditor from './pages/FooterEditor';
import EventsEditor from './pages/EventsEditor';
import EventLocationManager from './pages/EventLocationManager';
import EventTypeManager from './pages/EventTypeManager';
import CategoryManager from './pages/CategoryManager';
import SubcategoryManager from './pages/SubcategoryManager';
import ContentList from './pages/ContentList';
import ContentLinkEditor from './pages/ContentLinkEditor'; 
import CalendarEditor from './pages/CalendarEditor';   
import HomePageEditor from './pages/HomePageEditor';
import EditHome from './pages/EditHome';
import HomePagePreview from './pages/HomePagePreview';
import Login from './pages/Login';

function App() {
    return (
        <BrowserRouter>
            <div>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/dashboard" element={<LibraryCMS />} />
                    <Route path="/Top-Ribbon-Editor" element={<TopRibbonEditor />} />
                    <Route path="/Footer-Editor" element={<FooterEditor />} />
                    <Route path="/Events-Editor" element={<EventsEditor />} />
                    <Route path="/Event-Location-Manager" element={<EventLocationManager />} />
                    <Route path="/Event-Type-Manager" element={<EventTypeManager />} />
                    <Route path="/Category-Manager" element={<CategoryManager />} />
                    <Route path="/Subcategory-Manager" element={<SubcategoryManager />} />
                    <Route path="/subcategory/:id" element={<SubcategoryManager />} />
                    <Route path="/Interior-Page-Editor/:subcategoryId" element={<ContentList />} />
                    <Route path="/Link-Page-Editor/:subcategoryId" element={<ContentLinkEditor />} />
                    <Route path="/Calendar-Page-Editor/:subcategoryId" element={<CalendarEditor />} />
                    <Route path="/HomePage-Editor" element={<HomePageEditor />} />
                    <Route path="/edit/:id" element={<EditHome />} />
                    <Route path="/create" element={<EditHome />} />
                    <Route path="/preview" element={<HomePagePreview />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
