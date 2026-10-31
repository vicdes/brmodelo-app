import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Dialog from "../Dialog";

interface Workloads {
	name: string;
	description: string;
}

const WORKLOAD_OPTIONS: Workloads[] = [
	{
		name: "Muitas escritas ou atualizações",
		description: "Os dados são inseridos ou atualizados com frequência.",
	},
	{
		name: "Leitura predominante",
		description:
			"Há muitas consultas e poucas inserções, alterações ou remoções.",
	},
	{
		name: "Somente leitura",
		description: "Os dados são apenas consultados, sem alterações frequentes.",
	},
	{
		name: "Leitura dos dados mais recentes",
		description: "As consultas acessam principalmente os registros mais novos.",
	},
	{
		name: "Consultas por pequenos intervalos",
		description:
			"As consultas filtram dados por faixas curtas de tempo ou valores.",
	},
	{
		name: "Ler, modificar e gravar",
		description:
			"A aplicação lê um dado, altera seu conteúdo e grava novamente.",
	},
];
export interface WorkloadModalProps {
	open: boolean;
	cancelable?: boolean;
	onSuccess?: () => void;
	onCancel: () => void;
	onError?: (error: unknown) => void;
}

const WorkloadModal: React.FC<WorkloadModalProps> = ({
	open,
	onSuccess,
	onCancel,
}) => {
	const { t } = useTranslation(["common"]);
	const [workloadSelected, setWorkloadSelected] = useState<Workloads>();

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) return;
	};

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}
			title="Escolha a carga de trabalho mais adequada:"
			closeOnOverlayClick
			closeOnEscape
			contentStyle={{ backgroundColor: "white" }}
			titleStyle={{ fontSize: "1.5em", fontWeight: "bold", marginLeft: "12px", padding: "8px" }}
		>
			<div className="modal-body">
				<form
					className="form-horizontal"
					role="form"
					onSubmit={(event) => {
						event.preventDefault();
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
			<div className="modal-footer" style={{ margin: "8px"}}>
				<button
					className="br-button warning"
					type="button"
					style={{
						backgroundColor: "white",
						border: "1px solid #009980",
						borderRadius: "8px",
						color: "#009980",
						fontSize: "16px",
						padding: "12px"
					}}
					onClick={onCancel}
				>
					{t("Cancel")}
				</button>
				<button
					className="br-button"
					type="button"
					onClick={onSuccess}
					style={{
						backgroundColor: "#009980",
						border: "none",
						borderRadius: "8px",
						color: "white",
						fontSize: "16px",
						padding: "12px"
					}}
				>
					{t("Confirm")}
				</button>
			</div>
		</Dialog>
	);
};

export default WorkloadModal;
