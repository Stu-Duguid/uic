async function overstatCheck() {
    let url = "https://" + location.host + "/webapp/api/overstat/snapshot/all/full",
        obj = await (await fetch(url)).json(),
        i,
        snapshot;
    // console.log(obj.value)
    for (i = 0; i < obj.value.length; i++) {
        snapshot = obj.value[i];
        if (snapshot.screenView) continue;
        console.log("---> No screenView value for \"" + snapshot.displayName + "\" created by " + snapshot.userId);
        console.log(snapshot);
    }
    console.log("---> " + obj.value.length + " snapshots checked.");
}

overstatCheck();