import { Route, Routes } from 'react-router-dom'

import pages from '@pages/index'
import layouts from '@layouts/index'

const AppRoutes = () => {
    return (

        <Routes>
            <Route path='/login' element={<pages.LoginPage />} />

            {/* Wrapping all protected routes with MainLayout */}
            <Route element={<layouts.MainLayout />}>
                <Route path="/" element={<pages.DashboardPage />} />
                <Route path='/members' element={<pages.MembersPage />} />
                <Route path='/rooms' element={<pages.RoomPage />} />
                <Route path='/reports' element={<div>Reports Page</div>} />
                <Route path='/review' element={<div>Review Page</div>} />
            </Route>

        </Routes>
    )
}

export default AppRoutes
