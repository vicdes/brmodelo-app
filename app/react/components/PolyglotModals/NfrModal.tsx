import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Dialog from "../Dialog";

interface NonFunctionalRequirement {
	name: string;
	description: string;
}

const NFR_OPTIONS: NonFunctionalRequirement[] = [
	{
		name: "Strong consistency",
		description: "Ensure the validity of a transaction once completed.",
	},
	{
		name: "Data integrity",
		description: "Ensure the accuracy and integrity of data.",
	},
	{
		name: "Query complexity",
		description:
			"Requires operations involving multiple conditions, joins, etc.",
	},
	{
		name: "Scalability",
		description: "System's ability to handle horizontal growth.",
	},
	{
		name: "High data volume",
		description: "Storing and managing large amounts of data.",
	},
	{
		name: "High velocity",
		description: "Process data at high speeds.",
	},
	{
		name: "Schema flexibility",
		description:
			"Ability to accommodate changes in data structure without requiring extensive schema modifications.",
	},
	{
		name: "Heterogeneous data",
		description: "Requires handling data with different formats and sources.",
	},
];

export interface NfrModalProps {
	open: boolean;
	cancelable?: boolean;
	onSuccess?: () => void;
	onCancel: () => void;
	onError: (error: unknown) => void;
	initialValues: string[];
}

const NfrModal: React.FC<NfrModalProps> = ({
	open,
	cancelable = true,
	onSuccess,
	onCancel,
	onError,
	initialValues,
}) => {
	const { t } = useTranslation(["common"]);
	const [nfrsSelected, setNfrsSelected] = useState<NonFunctionalRequirement[]>(
		[],
	);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { value, checked } = e.target;
		const option = NFR_OPTIONS.find(({ name }) => name === value);
		return checked
			? setNfrsSelected((prev) => [...prev, option!])
			: setNfrsSelected((prev) => prev.filter(({ name }) => name !== value));
	};

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) return;
	};

	const handleSave = async (
		options: NonFunctionalRequirement[] | undefined,
	) => {
		try {
			return options;
		} catch (error) {
			onError(error);
		}
	};

	const handleConfirm = () => {
		//onSuccess?.(nfrsSelected);
		console.log(
			"Selected NFRs:",
			nfrsSelected.map((nfr) => nfr.name),
		);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}
			title={t("Choose the most suitable workload:")}
			closeOnOverlayClick
			closeOnEscape
			contentStyle={{ backgroundColor: "white" }}
			titleStyle={{
				fontSize: "1.4em",
				fontWeight: "bold",
				marginLeft: "12px",
				padding: "8px",
			}}
		>
			<div className="modal-body" style={{ padding: "6px" }}>
				<form
					className="form-horizontal"
					role="form"
					onSubmit={(event) => {
						event.preventDefault();
						handleSave(nfrsSelected);
					}}
				>
					<div className="form-group" style={{ margin: "16px" }}>
						<div>
							{NFR_OPTIONS.map((option, index) => (
								<div key={index} style={{ marginBottom: "12px" }}>
									<div style={{ display: "flex", alignItems: "center" }}>
										<input
											type="checkbox"
											name="model-type"
											value={option.name}
											checked={nfrsSelected.some(
												(nfr) => nfr.name === option.name,
											)}
											onChange={handleChange}
											style={{ margin: "8px" }}
										/>
										<span style={{ fontWeight: "bold", fontSize: "1.3em" }}>
											{t(option.name)}
										</span>
									</div>
									<div
										style={{
											marginLeft: "30px",
											fontSize: "1.1em",
											fontWeight: "lighter",
										}}
									>
										<span>{t(option.description)}</span>
									</div>
								</div>
							))}
						</div>
					</div>
				</form>
			</div>
			<div className="modal-footer" style={{ paddingTop: "8px" }}>
				<button
					className="br-button warning"
					type="button"
					style={{
						backgroundColor: "white",
						border: "1px solid #009980",
						borderRadius: "8px",
						color: "#009980",
						fontSize: "16px",
						padding: "12px",
					}}
					onClick={onCancel}
				>
					{t("Cancel")}
				</button>
				<button
					className="br-button"
					type="submit"
					onClick={handleConfirm}
					style={{
						backgroundColor: "#009980",
						border: "none",
						borderRadius: "8px",
						color: "white",
						fontSize: "16px",
						padding: "12px",
					}}
				>
					{t("Confirm")}
				</button>
			</div>
		</Dialog>
	);
};

export default NfrModal;
