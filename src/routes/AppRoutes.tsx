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
                <Route path='/approvals' element={<pages.ApprovalsPage />} />
                <Route path='/rooms' element={<pages.RoomPage />} />
                <Route path='/reports' element={<pages.ReportsPage/>} />
                <Route path='/review' element={<pages.ReviewPage />} />
            </Route>

        </Routes>
    )
}

export default AppRoutes
