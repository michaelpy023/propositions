import './index.css';
import { useState } from "react";
import * as Proposition from "./Proposition";
import * as Solver from "./Solver";
import { Form, Col, Row, Button, Container } from 'react-bootstrap';

const MutedTextRow = ({ text }) => (
    <Row>
        <Form.Text muted={true}>{text}</Form.Text>
    </Row>
);

const OperatorColButton = ({ text, onClick }) => (
    <Button as={Col} className="mx-1 my-1" onClick={onClick}>{text}</Button>
);

const PropositionInput = ({ value, onChange, onOperatorButtonClicked }) => {
    return (
        <>
            <Container className="mx-0 mt-2 mb-0">
                <Form>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Proposition</Form.Label>

                        <Form.Control
                            value={value} onChange={onChange} type="text" placeholder="Enter a proposition here"
                        />

                        <MutedTextRow text="You can use the following operators" />
                        <MutedTextRow text="~ for negation" />
                        <MutedTextRow text="v for disjunction" />
                        <MutedTextRow text="<->, <=> or = for biconditional" />
                        <MutedTextRow text="^ for conjunction" />
                        <MutedTextRow text=">, => or > for implication" />
                        <MutedTextRow text="Or use these buttons to insert an operator" />

                        <Row className="my-2">
                            <OperatorColButton text="Negation" onClick={onOperatorButtonClicked("~")} />
                            <OperatorColButton text="Disjunction" onClick={onOperatorButtonClicked("v")} />
                            <OperatorColButton text="Biconditional" onClick={onOperatorButtonClicked("<->")} />
                            <OperatorColButton text="Conjunction" onClick={onOperatorButtonClicked("^")} />
                            <OperatorColButton text="Implication" onClick={onOperatorButtonClicked("->")} />
                        </Row>
                    </Form.Group>
                </Form>
            </Container>
        </>
    );
};

const TruthTableRow = ({ value, isLastRow, isLastColumn }) => {
    let className = isLastRow ? "" : "border-bottom";

    className += isLastColumn ? "" : " border-end";

    return (
        <Row className={className}>
            <p className="text-center mb-2">{value}</p>
        </Row>
    );
};

const TruthTableColumn = ({ name, values, isLastColumn }) => {
    const rows = values.map((value, i, arr) =>
        <TruthTableRow key={i} value={value} isLastRow={i === arr.length - 1} isLastColumn={isLastColumn} />);

    let className = isLastColumn ? "border-bottom" : "border-bottom border-end";

    return (
        <Col>
            <Row className={className}>
                <p className="text-center mb-2">{name}</p>
            </Row>

            {rows}
        </Col>
    );
};

const TruthTable = ({ proposition, hasError, tree }) => {
    if (hasError || proposition.length === 0) return;

    const propositionalLetters = Solver.getPropositionalLetters(proposition);
    const combinationsByColumn = Solver.getAllPossibleCombinationsOfBinaryDigits(propositionalLetters.length);

    let values = [];
    let rowAmount = Math.pow(2, propositionalLetters.length);

    for (let i = 0; i < rowAmount; i++) {
        let valuesInThisRow = {};

        for (let j = 0; j < propositionalLetters.length; j++) {
            const letter = propositionalLetters[j];
            valuesInThisRow[letter] = combinationsByColumn[j][i];
        }

        values.push(Solver.calculate(tree, valuesInThisRow));
    }

    const columns = propositionalLetters
        .map((lett, i) => <TruthTableColumn key={i} name={lett} values={combinationsByColumn[i]} isLastColumn={false} />)
        .concat(<TruthTableColumn key={"proposition"} name={proposition} values={values} isLastColumn={true} />);

    return (
        <>
            <Container className="px-4 py-2 mb-3 bg-light rounded" fluid={true}>
                <Row>
                    {columns}
                </Row>

                {/* {rows} */}

            </Container>
        </>
    );
};

const BinaryTree = ({ tree }) => {
    let arr = Solver.treeToArray(tree);
    let rows = [];
    let index = 0;
    let rowAmount = 0;
    let sum = 0;

    while (sum < arr.length) {
        sum += Math.pow(2, rowAmount);
        rowAmount++;
    }

    for (let i = 0; i < rowAmount; i++) {
        let columns = [];

        for (let j = 0; j < Math.pow(2, i); j++) {
            columns.push(<Col key={j} className="border">
                <p className='text-center mb-2'>{index < arr.length ? arr[index] : ""}</p>
            </Col>);

            index++;
        }

        rows[i] = <Row key={i}>
            {columns}
        </Row>;
    }

    return (
        <>
            {rows}
            <Row className="mb-3"/>
        </>
    );
};

const InvalidPropositionError = ({ message }) => {
    // If there is no error, don't render this component
    if (message.length === 0) return;

    return (
        <>
            <Row>
                <p className="text-center text-danger mb-0 mt-0">{message}</p>;
                <p className="mb-4 mt-0" />
            </Row>
        </>
    );
};

const App = () => {
    const [input, setInput] = useState('');
    const [proposition, setProposition] = useState('');
    const [tree, setTree] = useState({});

    // Error stuff
    const [errorMessage, setErrorMessage] = useState('');

    const hasError = () => {
        return errorMessage.length > 0;
    };

    const checkInputValidity = (newInputValue, callback) => {
        const newProposition = Proposition.simplify(newInputValue);
        const valid = Proposition.isPropositionValid(newProposition);

        setErrorMessage(!valid ? '[ERROR] Invalid proposition' : '');
        callback(valid, newProposition);
    };

    const update = (newInput) => {
        setInput(newInput);

        checkInputValidity(newInput, (isValid, newProposition) => {
            if (isValid) {
                let tempTree = {};
                Solver.parse(tempTree, newProposition);
                setProposition(newProposition);
                setTree(tempTree);
            } else {
                setTree({});
            }
        });
    };

    const handleChange = (event) => {
        event.preventDefault();
        update(event.target.value);
    };

    const handleOperatorButtonClicked = (operator) => () => {
        const newInputValue = input + operator;
        update(newInputValue);
    };

    return (
        <>
            <Row className="mx-0 my-4">
                <Col />
                <Col className="border border-primary rounded" xs={10} sm={10} lg={6}>
                    <h2 className="text-primary text-center my-3">Truth Table Generator</h2>
                    <PropositionInput
                        value={input} onChange={handleChange} onOperatorButtonClicked={handleOperatorButtonClicked} />
                    <InvalidPropositionError message={errorMessage} />
                    <TruthTable proposition={proposition} hasError={hasError()} tree={tree}/>
                    <BinaryTree tree={tree}/>
                </Col>
                <Col />
            </Row>
        </>
    );
};

export default App;
