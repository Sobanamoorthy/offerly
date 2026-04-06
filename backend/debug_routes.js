const express = require("express");
const router = require("./routes/adminRoutes");
const app = express();
app.use("/api/admin", router);
console.log("Registered Routes:");
app._router.stack.forEach(r => {
    if (r.route && r.route.path) {
        console.log(`${Object.keys(r.route.methods).join(',').toUpperCase()} ${r.route.path}`);
    } else if (r.name === 'router') {
        r.handle.stack.forEach(sr => {
            if (sr.route) {
                console.log(`${Object.keys(sr.route.methods).join(',').toUpperCase()} /api/admin${sr.route.path}`);
            }
        });
    }
});
process.exit(0);
