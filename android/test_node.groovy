def resolveNode = {
    def candidates = [
        System.getenv("NODE_BINARY"),
        "node",
        "/opt/homebrew/bin/node",
        "/usr/local/bin/node",
    ]
    for (candidate in candidates) {
        if (!candidate) continue
        try {
            println "Testing candidate: $candidate"
            def process = [candidate, "--version"].execute()
            process.waitFor()
            println "Exit value for $candidate: ${process.exitValue()}"
            if (process.exitValue() == 0) return candidate
        } catch (Exception e) {
            println "Error testing $candidate: ${e.message}"
        }
    }
    return "node"
}

println "Resolved node: " + resolveNode()
