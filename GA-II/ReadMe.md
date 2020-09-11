# Genetic Algorithm with multiple objectives

GA-II is very similar to GA-I except it uses two objectives in its fitness function - opcode coverage and gas usage. We optimise to achieve higher coverage while 
lowering gas usage.

# Way to generate Solidity dependent file - ABI, OPCODE, BYTECODE 

solc SAMPLECONTRACT.SOL --abi >> $ABI_FILE

solc SAMPLECONTRACT.SOL --bin >> $BYTECODE_FILE

solc SAMPLECONTRACT.SOL --opcodes >> $OPCODE_FILE


# Way to run using JAR file


java -jar GA_II_Input_Generator.jar "$ABI_FILE".abi $NAME_OF_THE_CONTRACT "$BYTECODE_FILE".txt POPULATION_SIZE MIN_DESIRED_COVERAGE NUMBER_OF_ITERATION "$PATH_OF_THE_EXECUTION_ENVIROMENT" MUTATION_RATE CROSSOVER_RATE "$OPCODE_FILE".txt "$OUTPUT_FILE"_GA_scenario.json
