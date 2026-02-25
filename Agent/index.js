/**
 * Created by Ngoc on 24-03-2018.
 */

StartAgent();

function StartAgent() {
    var Agent = require('./Agent');
    var AgentProc = new Agent();
    AgentProc.Start();
}
