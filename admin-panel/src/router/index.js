import { createRouter, createWebHistory } from 'vue-router'
// We will create these views later
import Dashboard from '../views/Dashboard.vue'
import Activities from '../views/Activities.vue'
import Tasks from '../views/Tasks.vue'
import UserDetail from '../views/UserDetail.vue'

const routes = [
    {
        path: '/',
        redirect: '/activities'
    },
    {
        path: '/dashboard/:id',
        name: 'Dashboard',
        component: Dashboard
    },
    {
        path: '/activities',
        name: 'Activities',
        component: Activities
    },
    {
        path: '/tasks/:activityId',
        name: 'Tasks',
        component: Tasks
    },
    {
        path: '/user/:activityId/:email',
        name: 'UserDetail',
        component: UserDetail
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
