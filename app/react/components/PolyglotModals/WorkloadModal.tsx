import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Dialog from "../Dialog";

interface Workloads {
	name: string;
	description: string;
}

const WORKLOAD_OPTIONS: Workloads[] = [
	{
		name: "Write-heavy or update-heavy",
		description: "Data is inserted or updated frequently.",
	},
	{
		name: "Read-heavy",
		description: "There are many queries and few inserts, updates, or deletions.",
	},
	{
		name: "Read-only",
		description: "Data is only queried, with no frequent changes.",
	},
	{
		name: "Reading the most recent data",
		description: "Queries mainly access the newest records.",
	},
	{
		name: "Small range queries",
		description: "Queries filter data by short ranges of time or values.",
	},
	{
		name: "Read-modify-write",
		description: "The application reads a record, changes its content, and writes it back.",
	},
];
export interface WorkloadModalProps {
	open: boolean;
	cancelable?: boolean;
	onSuccess: () => void;
	onCancel: () => void;
	onError: (error: unknown) => void;
}

const WorkloadModal: React.FC<WorkloadModalProps> = ({
	open,
	onSuccess,
	onCancel,
	onError,
}) => {
	const { t } = useTranslation(["common"]);
	const [workloadSelected, setWorkloadSelected] = useState<Workloads>();

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) return;
	};

	const handleSave = async (option: Workloads | undefined) => {
		try {
			return option?.name;
		} catch (error) {
			onError(error);
		}
	};

	const handleConfirm = () => {
		if (!workloadSelected) return;
		onSuccess?.(workloadSelected.name);
	};

	const isDisabled = workloadSelected === undefined;

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}
			title="Choose the most suitable workload:"
			closeOnOverlayClick
			closeOnEscape
			contentStyle={{ backgroundColor: "white" }}
			titleStyle={{
				fontSize: "1.5em",
				fontWeight: "bold",
				marginLeft: "12px",
				padding: "8px",
			}}
		>
			<div className="modal-body">
				<form
					className="form-horizontal"
					role="form"
					onSubmit={(event) => {
						event.preventDefault();
						handleSave(workloadSelected);
					}}
				>
					<div className="form-group" style={{ margin: "16px" }}>
						<div>
							{WORKLOAD_OPTIONS.map((option, index) => (
								<div key={index} style={{ marginBottom: "12px" }}>
									<div style={{ display: "flex", alignItems: "center" }}>
										<input
											type="radio"
											name="model-type"
											value={option.name}
											checked={workloadSelected?.name === option.name}
											onChange={() => setWorkloadSelected(option)}
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
			<div className="modal-footer" style={{ margin: "8px" }}>
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
						opacity: isDisabled ? "0.6" : "1",
					}}
					disabled={isDisabled}
				>
					{t("Confirm")}
				</button>
			</div>
		</Dialog>
	);
};

export default WorkloadModal;
