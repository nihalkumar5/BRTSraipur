def candidates = [
    "/opt/homebrew/bin/node",
    "/usr/local/bin/node",
    "/usr/bin/node",
]
for (candidate in candidates) {
    def f = new File(candidate)
    println "Checking $candidate: exists=${f.exists()}, canExecute=${f.canExecute()}"
}
println "System.getenv('NODE_BINARY'): ${System.getenv('NODE_BINARY')}"
